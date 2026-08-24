const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = `cd /root && docker compose exec mongo mongosh marketplace --quiet --eval "db.services.updateMany({ category: 'LIVE STREAM' }, { \\$set: { category: 'Live Streaming' } })"`;
  conn.exec(cmd, (err, stream) => {
    stream.pipe(process.stdout);
    stream.on('close', () => conn.end());
  });
}).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2'
});
