const fs = require('fs');
const { Client } = require('ssh2');

// Read local files
let dcContent = fs.readFileSync('docker-compose.yml', 'utf8');
// Remove BOM if present locally
dcContent = dcContent.replace(/^\uFEFF/, '');
dcContent = dcContent.replace(/\$\{MONGO_INITDB_ROOT_PASSWORD:-changeit\}/g, '${MONGO_URI_PASSWORD:-changeit}');

const conn = new Client();
conn.on('ready', () => {
  // Read remote .env
  conn.exec('cat /root/.env', (err, stream) => {
    if (err) throw err;
    let envContent = '';
    stream.on('data', d => envContent += d.toString()).stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => {
      // Parse password
      const passMatch = envContent.match(/MONGO_INITDB_ROOT_PASSWORD=(.*)/);
      if (!passMatch) {
        console.error("No password found");
        return conn.end();
      }
      let rawPass = passMatch[1].trim();
      const encodedPass = encodeURIComponent(rawPass);

      envContent = envContent.replace(/^\uFEFF/, '');
      if (!envContent.includes('MONGO_URI_PASSWORD')) {
        envContent += `\nMONGO_URI_PASSWORD=${encodedPass}\n`;
      } else {
        envContent = envContent.replace(/MONGO_URI_PASSWORD=.*/, `MONGO_URI_PASSWORD=${encodedPass}`);
      }

      // Write files
      conn.sftp((err, sftp) => {
        if (err) throw err;
        
        sftp.writeFile('/root/docker-compose.yml', dcContent, (err) => {
          if (err) throw err;
          sftp.writeFile('/root/.env', envContent, (err) => {
            if (err) throw err;
            
            // Run docker compose
            conn.exec('cd /root && docker compose up -d', (err, stream2) => {
              stream2.on('data', d => process.stdout.write(d)).stderr.on('data', d => process.stderr.write(d));
              stream2.on('close', () => {
                console.log("Done");
                conn.end();
              });
            });
          });
        });
      });
    });
  });
}).on('error', (err) => console.error(err)).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2',
  readyTimeout: 60000
});
