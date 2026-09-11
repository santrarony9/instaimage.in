const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  console.log('Connected!');
  // The .ts files I uploaded earlier may have caused issues with the source compilation
  // Let's check what's actually crashing and restore if needed
  // First: get the actual crash reason from docker logs
  conn.exec('docker logs --tail=80 root-api-1 2>&1', (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => {
      console.log('CRASH LOGS:', out.slice(-3000));
      conn.end();
      process.exit(0);
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
