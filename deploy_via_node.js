const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    console.log('SFTP :: ready, uploading deploy.tar...');
    sftp.fastPut('deploy.tar', '/root/deploy.tar', (err) => {
      if (err) throw err;
      console.log('File uploaded. Running deployment commands...');
      conn.exec('cd /root && tar -xf deploy.tar && rm deploy.tar && docker compose up --build -d', (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          console.log('Deployment complete. Exit code: ' + code);
          conn.end();
        }).on('data', (data) => {
          process.stdout.write(data);
        }).stderr.on('data', (data) => {
          process.stderr.write(data);
        });
      });
    });
  });
}).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2',
  readyTimeout: 20000
});
