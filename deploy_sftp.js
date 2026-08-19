const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected to VPS');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    
    // 1. Delete packages and addons modules
    const cmd = `rm -rf ~/backend/apps/api/src/modules/packages ~/backend/apps/api/src/modules/addons`;
    conn.exec(cmd, (err, stream) => {
      if (err) throw err;
      stream.on('close', () => {
        console.log('Deleted old modules.');
        
        // 2. Upload modified files
        const uploads = [
          ['d:\\anti gravity\\InstaImage_Source_Code (1)\\backend\\apps\\api\\src\\api.module.ts', '/root/backend/apps/api/src/api.module.ts'],
          ['d:\\anti gravity\\InstaImage_Source_Code (1)\\backend\\apps\\api\\src\\modules\\services\\schemas\\service.schema.ts', '/root/backend/apps/api/src/modules/services/schemas/service.schema.ts'],
          ['d:\\anti gravity\\InstaImage_Source_Code (1)\\backend\\apps\\api\\src\\modules\\services\\dto\\create-service.dto.ts', '/root/backend/apps/api/src/modules/services/dto/create-service.dto.ts']
        ];
        
        let uploaded = 0;
        uploads.forEach(([local, remote]) => {
          sftp.fastPut(local, remote, (err) => {
            if (err) console.error('Failed to upload', local, err);
            uploaded++;
            if (uploaded === uploads.length) {
              console.log('Uploaded files.');
              
              // 3. Rebuild and restart API
              conn.exec(`cd ~ && docker-compose build api && docker-compose up -d --no-deps api`, (err, stream2) => {
                let out = '';
                stream2.on('data', d => out += d);
                stream2.stderr.on('data', d => out += d);
                stream2.on('close', () => {
                  console.log(out);
                  conn.end();
                });
              });
            }
          });
        });
      });
    });
  });
}).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2',
});
