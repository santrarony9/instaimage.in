const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected to VPS');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    
    const uploads = [
      ['d:\\anti gravity\\InstaImage_Source_Code (1)\\backend\\apps\\api\\src\\modules\\bookings\\schemas\\booking.schema.ts', '/root/backend/apps/api/src/modules/bookings/schemas/booking.schema.ts'],
      ['d:\\anti gravity\\InstaImage_Source_Code (1)\\backend\\apps\\api\\src\\modules\\bookings\\dto\\create-booking.dto.ts', '/root/backend/apps/api/src/modules/bookings/dto/create-booking.dto.ts'],
      ['d:\\anti gravity\\InstaImage_Source_Code (1)\\backend\\apps\\api\\src\\modules\\bookings\\bookings.service.ts', '/root/backend/apps/api/src/modules/bookings/bookings.service.ts'],
      ['d:\\anti gravity\\InstaImage_Source_Code (1)\\backend\\apps\\api\\src\\modules\\bookings\\bookings.module.ts', '/root/backend/apps/api/src/modules/bookings/bookings.module.ts'],
      ['d:\\anti gravity\\InstaImage_Source_Code (1)\\backend\\apps\\api\\src\\seed.ts', '/root/backend/apps/api/src/seed.ts'],
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
          
          const cmd = `cd ~/backend && docker compose build api && docker compose up -d --no-deps api`;
          conn.exec(cmd, (err, stream) => {
            if (err) throw err;
            let out = '';
            stream.on('data', d => out += d.toString());
            stream.stderr.on('data', d => out += d.toString());
            stream.on('close', () => {
              console.log(out);
              conn.end();
            });
          });
        }
      });
    });
  });
}).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2',
});
