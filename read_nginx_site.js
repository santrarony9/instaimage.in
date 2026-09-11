const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = 'ls /etc/nginx/sites-enabled/';
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
      console.log('Sites enabled:', out);
      
      // Now read the api config
      conn.exec('cat /etc/nginx/sites-enabled/instaimage', (err, stream2) => {
        let out2 = '';
        stream2.on('data', d => out2 += d);
        stream2.on('close', () => {
          console.log('Main site config (full):\n', out2);
          conn.end();
          process.exit(0);
        });
      });
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
