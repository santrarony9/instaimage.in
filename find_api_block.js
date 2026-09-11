const { Client } = require('ssh2');

function tryConnect(attempt) {
  const conn = new Client();
  conn.on('ready', () => {
    console.log('Connected attempt', attempt);
    // The instaimage site config routes instaimage.in -> port 3000 (frontend Docker)
    // The api.instaimage.in must be handled by Certbot/SSL redirect or another block
    // Check all SSL blocks
    const cmd = 'nginx -T 2>/dev/null | grep -A 30 "api.instaimage"';
    conn.exec(cmd, (err, stream) => {
      if (err) throw err;
      let out = '';
      stream.on('data', d => out += d);
      stream.stderr.on('data', d => out += d);
      stream.on('close', () => {
        console.log('API SSL block:\n', out || '(not found in nginx -T)');
        
        // Also check Cloudflare - maybe api.instaimage.in goes through CF tunnel  
        // For now check all certbot certs
        conn.exec('certbot certificates 2>/dev/null | grep -A5 "api"', (err2, stream2) => {
          let out2 = '';
          stream2.on('data', d => out2 += d);
          stream2.on('close', () => {
            console.log('Certbot certs:', out2);
            conn.end();
            process.exit(0);
          });
        });
      });
    });
  }).on('error', err => {
    console.log('Attempt', attempt, ':', err.message);
    if (attempt < 5) setTimeout(() => tryConnect(attempt + 1), 20000);
    else process.exit(1);
  }).connect({
    host: '135.125.9.81',
    port: 20064,
    username: 'root',
    password: 'SRhP8Rw_WJD8jZP2',
    readyTimeout: 30000
  });
}
setTimeout(() => tryConnect(1), 10000);
