const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `cd /root && docker compose exec mongo mongosh marketplace -eval "db.services.updateMany({}, { \\$set: { isApproved: true } })"`;
  
  conn.exec(cmd, (err, stream) => {
    let data = '';
    stream.on('data', d => data += d);
    stream.on('close', () => {
      console.log('Update Response:', data);
      conn.end();
    });
  });
}).on('error', err => console.error(err)).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2',
  readyTimeout: 60000
});
