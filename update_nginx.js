const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    sftp.fastPut('nginx.conf', '/root/nginx.conf', (err) => {
      if (err) throw err;
      conn.exec('cd /root && docker compose restart nginx', (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          conn.end();
        }).on('data', (data) => {
          process.stdout.write(data);
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
