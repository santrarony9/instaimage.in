const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected!');
  // Test if the nginx container can reach api:3000
  const cmd = 'docker exec root-nginx-1 wget -qO- http://api:3000/v1/services 2>&1 | head -50';
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => {
      console.log('Nginx->API test:', out.slice(0, 500));
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
