const { Client } = require('ssh2');
const conn = new Client();
console.log('Connecting to VPS...');
conn.on('ready', () => {
  console.log('SSH connection successful');
  const cmd = `cd ~/backend && echo "INSTAMOJO_API_KEY=e4e6a145d970ff28ced07c7daaa0ad47" >> .env && echo "INSTAMOJO_AUTH_TOKEN=ce6076ab7b853c4384b6eb9aa4cbd034" >> .env && docker compose restart api workers`;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', (code) => {
      console.log('Result:', out);
      console.log('Done!');
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
  readyTimeout: 10000
});
