const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`curl -s -v http://localhost/api/v1/availability/check`, (err, stream) => {
    let data = '';
    stream.on('data', d => data += d);
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => {
      console.log('Response:', data);
      conn.end();
    });
  });
}).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2',
  readyTimeout: 60000
});
