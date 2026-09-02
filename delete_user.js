const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec("docker exec root-mongo-1 mongosh marketplace --authenticationDatabase admin -u admin -p changeit --eval 'db.users.deleteMany({ phone: \"8240054002\" })'", (err, stream) => {
    if (err) throw err;
    stream.on('data', d => console.log(d.toString()));
    stream.stderr.on('data', d => console.error(d.toString()));
    stream.on('close', () => {
      console.log('User deleted');
      conn.end();
    });
  });
}).connect({
  host: '135.125.9.81', port: 20064, username: 'root', password: 'SRhP8Rw_WJD8jZP2', readyTimeout: 10000
});
