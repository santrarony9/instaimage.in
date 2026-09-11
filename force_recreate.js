const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  // Force a full container recreation to pick up the new .env (restart alone doesn't reload env_file)
  const cmd = `cd /root && docker compose up -d --force-recreate api workers 2>&1`;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', (code) => {
      console.log('Output:', out);
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
