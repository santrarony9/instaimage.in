const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  console.log('Connected to VPS');
  const cmd = `docker exec root-mongo-1 mongosh instaimage -u admin -p 'InstaMongo2026!' --authenticationDatabase admin --eval "db.services.find({}).forEach(function(s) { if (!s.sku) { var sku = 'SRV-' + Math.random().toString(36).substring(2,8).toUpperCase(); db.services.updateOne({_id: s._id}, {\\$set: {sku: sku}}); print('Updated ' + s.name + ' with ' + sku); } })"`;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', (d) => { console.log(d.toString()); });
    stream.stderr.on('data', (d) => { console.error(d.toString()); });
    stream.on('close', () => { console.log('Done'); conn.end(); });
  });
}).on('error', (err) => {
  console.error('Connection error:', err.message);
}).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2'
});
