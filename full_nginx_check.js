const { Client } = require('ssh2');

function tryConnect(attempt) {
  const conn = new Client();
  conn.on('ready', () => {
    console.log('SSH Connected!');
    // Get everything in one command
    const cmd = 'cat /etc/nginx/sites-enabled/instaimage 2>/dev/null; echo "=CONF_D="; ls /etc/nginx/conf.d/; cat /etc/nginx/conf.d/*.conf 2>/dev/null';
    conn.exec(cmd, (err, stream) => {
      if (err) throw err;
      let out = '';
      stream.on('data', d => out += d);
      stream.stderr.on('data', d => out += d);
      stream.on('close', () => {
        console.log(out);
        conn.end();
        process.exit(0);
      });
    });
  }).on('error', err => {
    console.log('Attempt', attempt, 'failed, retrying in 20s...');
    if (attempt < 8) setTimeout(() => tryConnect(attempt + 1), 20000);
    else process.exit(1);
  }).connect({
    host: '135.125.9.81',
    port: 20064,
    username: 'root',
    password: 'SRhP8Rw_WJD8jZP2',
    readyTimeout: 30000
  });
}
tryConnect(1);
