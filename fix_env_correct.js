const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  console.log('Connected!');
  const cmd = [
    // The docker-compose.yml is at /root/ and loads /root/.env
    // Add Instamojo keys to the CORRECT /root/.env file
    'grep -q "INSTAMOJO_API_KEY" ~/.env && echo "Keys already in /root/.env" || echo "INSTAMOJO_API_KEY=e4e6a145d970ff28ced07c7daaa0ad47" >> ~/.env',
    'grep -q "INSTAMOJO_AUTH_TOKEN" ~/.env && echo "Token already in /root/.env" || echo "INSTAMOJO_AUTH_TOKEN=ce6076ab7b853c4384b6eb9aa4cbd034" >> ~/.env',
    // Also set FRONTEND_URL so redirect after payment goes to correct domain
    'grep -q "FRONTEND_URL" ~/.env && echo "FRONTEND_URL already set" || echo "FRONTEND_URL=https://instaimage.in" >> ~/.env',
    // Restart containers to pick up new env vars
    'docker compose restart api workers'
  ].join(' && ');
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', (code) => {
      console.log('Output:\n', out);
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
  readyTimeout: 30000
});
