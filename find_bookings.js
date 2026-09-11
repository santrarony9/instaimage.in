const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('find /root -name "bookings.service.ts"', (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
      console.log('Found:', out);
      conn.end();
      process.exit(0);
    });
  });
}).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2',
  readyTimeout: 10000
});
