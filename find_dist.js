const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('find /root/backend/dist -name "bookings.service.js" 2>/dev/null | head -5', (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => {
      console.log('Found dist files:\n', out || '(none found)');
      conn.end();
      process.exit(0);
    });
  });
}).on('error', err => {
  console.error('Error:', err.message);
  process.exit(1);
}).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2',
  readyTimeout: 30000
});
