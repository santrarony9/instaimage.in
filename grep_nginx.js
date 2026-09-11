const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected!');
  // Find the api.instaimage.in server block across ALL nginx conf files
  const cmd = 'grep -r "api.instaimage.in" /etc/nginx/ 2>/dev/null; grep -rn "20065" /etc/nginx/ 2>/dev/null';
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => {
      console.log('Search results:', out);
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
