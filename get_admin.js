const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  // Let's run a mongo shell command inside the mongo container to find the admin user
  const cmd = `docker exec root-mongo-1 mongosh -u root -p "InstaMongo2026!" --authenticationDatabase admin instaimage --eval "db.users.findOne({ role: 'ADMIN' })"`;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => {
      console.log('Mongo output:\n', out);
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
