const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = 'docker exec root-nginx-1 ls /etc/nginx/sites-enabled/ 2>/dev/null; find / -name "*.conf" 2>/dev/null | grep -i nginx | grep -v "proc" | head -20; ls /etc/nginx/conf.d/ 2>/dev/null';
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => {
      console.log('Files:\n', out);
      conn.end();
      process.exit(0);
    });
  });
}).on('error', err => {
  console.error(err.message);
  process.exit(1);
}).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2',
  readyTimeout: 30000
});
