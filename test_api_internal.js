const { Client } = require('ssh2');
const c = new Client();
c.on('ready', () => {
  c.exec('docker exec root-api-1 node -e "fetch(\'http://localhost:3000/v1/categories\').then(r => console.log(r.status))"', (err, s) => {
    if (err) throw err;
    s.on('data', d => process.stdout.write(d.toString()));
    s.on('close', () => c.end());
  });
}).connect({host: '135.125.9.81', port: 20064, username: 'root', password: 'SRhP8Rw_WJD8jZP2'});
