const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`cat /root/docker-compose.yml`, (err, stream) => {
    if (err) throw err;
    let data = '';
    stream.on('data', d => data += d.toString()).stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => {
      console.log(data);
      conn.end();
    });
  });
}).on('error', (err) => console.error(err)).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2',
  readyTimeout: 60000
});
