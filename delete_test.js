const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`docker exec root-mongo-1 mongosh -u admin -p "InstaMongo2026!" --authenticationDatabase admin marketplace --eval "db.services.deleteOne({slug: 'test-product'})"`, (err, stream) => {
    stream.on('close', () => conn.end()).on('data', data => console.log(data.toString())).stderr.on('data', data => console.error(data.toString()));
  });
}).connect({ host: '135.125.9.81', port: 20064, username: 'root', password: process.env.VPS_PASSWORD || 'SRhP8Rw_WJD8jZP2' });
