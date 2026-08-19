const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected to VPS');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    console.log('Uploading backend.zip...');
    sftp.fastPut('d:\\anti gravity\\InstaImage_Source_Code (1)\\backend.zip', '/root/backend.zip', (err) => {
      if (err) throw err;
      console.log('Uploaded. Extracting and rebuilding...');
      const cmd = `cd ~/ && unzip -o backend.zip && cd backend && docker-compose up -d --build api`;
      conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        let out = '';
        stream.on('data', (d) => { out += d.toString(); });
        stream.stderr.on('data', (d) => { out += d.toString(); });
        stream.on('close', () => { console.log(out.trim()); conn.end(); });
      });
    });
  });
}).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2',
});
