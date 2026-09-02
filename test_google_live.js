const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Testing /v1/auth/google directly on api:3000 ...');
  
  const cmd = `docker exec root-nginx-1 wget -S -O- http://api:3000/v1/auth/google 2>&1`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.on('close', () => {
      conn.end();
    });
  });
}).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2'
});
