const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected to VPS! Testing /v1/auth/whatsapp/send-otp ...');
  
  const cmd = `docker exec root-nginx-1 wget -qO- --post-data='{"phone":"918240054002","name":"User"}' --header='Content-Type: application/json' http://api:3000/v1/auth/whatsapp/send-otp`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => {
      console.log('\nTest completed.');
      conn.end();
    });
  });
}).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2'
});
