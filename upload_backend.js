const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    console.log('SFTP connected');

    const filesToUpload = [
      {
        local: 'd:\\anti gravity\\InstaImage_Source_Code (1)\\backend\\apps\\api\\src\\modules\\bookings\\bookings.controller.ts',
        remote: '/root/backend/apps/api/src/modules/bookings/bookings.controller.ts'
      },
      {
        local: 'd:\\anti gravity\\InstaImage_Source_Code (1)\\backend\\apps\\api\\src\\modules\\bookings\\bookings.service.ts',
        remote: '/root/backend/apps/api/src/modules/bookings/bookings.service.ts'
      },
      {
        local: 'd:\\anti gravity\\InstaImage_Source_Code (1)\\backend\\apps\\api\\src\\modules\\bookings\\schemas\\booking.schema.ts',
        remote: '/root/backend/apps/api/src/modules/bookings/schemas/booking.schema.ts'
      }
    ];

    let completed = 0;
    filesToUpload.forEach(f => {
      sftp.fastPut(f.local, f.remote, (err) => {
        if (err) {
          console.error(`Failed to upload ${f.local}:`, err);
        } else {
          console.log(`Uploaded ${f.local} -> ${f.remote}`);
        }
        completed++;
        if (completed === filesToUpload.length) {
          console.log('All files uploaded. Rebuilding Docker container...');
          
          conn.exec('cd /root && docker compose build api workers && docker compose up -d --no-deps api workers', (err, stream) => {
            if (err) throw err;
            stream.on('data', d => process.stdout.write(d.toString()));
            stream.stderr.on('data', d => process.stderr.write(d.toString()));
            stream.on('close', () => {
              console.log('Deployment finished.');
              conn.end();
              process.exit(0);
            });
          });
        }
      });
    });
  });
}).on('error', err => {
  console.error('SSH Error:', err.message);
  process.exit(1);
}).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2',
  readyTimeout: 30000
});
