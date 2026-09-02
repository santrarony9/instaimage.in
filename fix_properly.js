const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`cat /root/.env && echo "=====" && cat /root/docker-compose.yml`, (err, stream) => {
    if (err) throw err;
    let data = '';
    stream.on('data', d => data += d.toString()).stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => {
      const parts = data.split('=====');
      let envContent = parts[0];
      let dcContent = parts[1];

      // Parse env password
      const passMatch = envContent.match(/MONGO_INITDB_ROOT_PASSWORD=(.*)/);
      if (!passMatch) {
        console.error("No password found");
        return conn.end();
      }
      const rawPass = passMatch[1].trim();
      const encodedPass = encodeURIComponent(rawPass);

      // Update .env
      if (!envContent.includes('MONGO_URI_PASSWORD')) {
        envContent += `\nMONGO_URI_PASSWORD=${encodedPass}\n`;
      } else {
        envContent = envContent.replace(/MONGO_URI_PASSWORD=.*/, `MONGO_URI_PASSWORD=${encodedPass}`);
      }

      // Update docker-compose.yml
      dcContent = dcContent.replace(/^\uFEFF/, '').replace(/\$\{MONGO_INITDB_ROOT_PASSWORD:-changeit\}/g, '${MONGO_URI_PASSWORD:-changeit}');

      // Write back
      conn.exec(`
        cat << 'EOF' > /root/.env
${envContent.replace(/^\uFEFF/, '')}EOF
        cat << 'EOF' > /root/docker-compose.yml
${dcContent}EOF
        docker compose up -d
      `, (err2, stream2) => {
        stream2.on('data', d => process.stdout.write(d)).stderr.on('data', d => process.stderr.write(d));
        stream2.on('close', () => conn.end());
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
