const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected to VPS');
  const cmd = `docker exec mongo mongosh instaimage -u admin -p 'InstaMongo2026!' --authenticationDatabase admin --eval "db.coupons.updateOne({code: 'WELCOME500'}, {\\$set: {discountType: 'FIXED', discountValue: 500, minOrderValue: 5000, isActive: true, validFrom: new Date(), validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 10))}}, {upsert: true})"`;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', (d) => { console.log(d.toString()); });
    stream.stderr.on('data', (d) => { console.error(d.toString()); });
    stream.on('close', () => { console.log('Done'); conn.end(); });
  });
}).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2',
});
