const { Client } = require('ssh2');

function tryConnect(attempt) {
  const conn = new Client();
  conn.on('ready', () => {
    console.log('Connected on attempt', attempt);
    // Check Nginx config and container status
    const cmd = 'docker ps -a --format "{{.Names}} {{.Status}}" && echo "---NGINX---" && cat /etc/nginx/conf.d/default.conf 2>/dev/null || cat /etc/nginx/nginx.conf 2>/dev/null | grep -A5 "api"';
    conn.exec(cmd, (err, stream) => {
      if (err) throw err;
      let out = '';
      stream.on('data', d => out += d);
      stream.stderr.on('data', d => out += d);
      stream.on('close', () => {
        console.log('Output:\n', out.slice(0, 3000));
        conn.end();
        process.exit(0);
      });
    });
  }).on('error', err => {
    console.log('Attempt', attempt, 'failed:', err.message);
    if (attempt < 10) setTimeout(() => tryConnect(attempt + 1), 15000);
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
