const { Client } = require('ssh2');

function tryConnect(attempt) {
  const conn = new Client();
  conn.on('ready', () => {
    console.log('Connected!');
    // Check what port the Docker Nginx is on and what host the Cloudflare routes to
    // Also check the instaimage sites config for SSL (api.instaimage.in block)
    const cmd = 'nginx -T 2>&1 | grep -E "(server_name|listen|proxy_pass)" | head -40';
    conn.exec(cmd, (err, stream) => {
      if (err) throw err;
      let out = '';
      stream.on('data', d => out += d);
      stream.stderr.on('data', d => out += d);
      stream.on('close', () => {
        console.log('Nginx config summary:\n', out);
        
        // Check if there is a separate api nginx file
        conn.exec('find /etc/nginx -type f -name "*.conf" -exec cat {} \\; | grep -B5 -A20 "api.instaimage"', (err2, stream2) => {
          let out2 = '';
          stream2.on('data', d => out2 += d);
          stream2.on('close', () => {
            console.log('API config found:\n', out2 || '(NONE)');
            conn.end();
            process.exit(0);
          });
        });
      });
    });
  }).on('error', err => {
    console.log('Attempt', attempt, ':', err.message);
    if (attempt < 5) setTimeout(() => tryConnect(attempt + 1), 25000);
    else process.exit(1);
  }).connect({
    host: '135.125.9.81',
    port: 20064,
    username: 'root',
    password: 'SRhP8Rw_WJD8jZP2',
    readyTimeout: 30000
  });
}
setTimeout(() => tryConnect(1), 15000);
