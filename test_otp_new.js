const { Client } = require('ssh2');
const c = new Client();
c.on('ready', () => {
  const cmd = "docker exec root-nginx-1 wget -qO- --post-data='{\"phone\":\"919748666210\",\"name\":\"Test\"}' --header='Content-Type: application/json' http://api:3000/v1/auth/whatsapp/send-otp";
  c.exec(cmd, (_, s) => {
    s.on('data', d => process.stdout.write(d.toString()));
    s.stderr.on('data', d => process.stderr.write(d.toString()));
    s.on('close', () => c.end());
  });
}).connect({ host: '135.125.9.81', port: 20064, username: 'root', password: 'SRhP8Rw_WJD8jZP2' });
