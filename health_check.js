const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected to VPS');
  const cmd = `curl -s -v http://localhost:20065/v1/services/6a83f3ead17e5c8a36973cf5`;
  conn.exec(cmd, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    let out = '';
    stream.on('data', (d) => { out += d.toString(); });
    stream.stderr.on('data', (d) => { out += d.toString(); });
    stream.on('close', () => { console.log(out.trim()); conn.end(); });
  });
}).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2',
});
