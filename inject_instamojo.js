const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connection successful');
  const cmd = `cd /root/instaimage/backend && echo "INSTAMOJO_API_KEY=e4e6a145d970ff28ced07c7daaa0ad47" >> .env && echo "INSTAMOJO_AUTH_TOKEN=ce6076ab7b853c4384b6eb9aa4cbd034" >> .env && docker compose restart api workers`;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
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
  readyTimeout: 15000
});
