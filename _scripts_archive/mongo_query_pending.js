const { Client } = require('ssh2'); 
const conn = new Client(); 
conn.on('ready', () => { 
  const mongoCmd = `docker exec root-mongo-1 mongosh -u admin -p "InstaMongo2026!" --authenticationDatabase admin marketplace --eval "db.bookings.findOne({_id: ObjectId('6a962a98816c729e1eb12448')})"`; // wait, what is the ID?
  conn.exec(`docker exec root-mongo-1 mongosh -u admin -p "InstaMongo2026!" --authenticationDatabase admin marketplace --eval "db.bookings.findOne({status: 'PENDING_PAYMENT'})"`, (err, stream) => { 
    stream.on('data', d => console.log(d.toString())); 
    stream.stderr.on('data', d => console.error(d.toString())); 
    stream.on('close', () => conn.end()); 
  }); 
}).connect({ host: '135.125.9.81', port: 20064, username: 'root', password: 'SRhP8Rw_WJD8jZP2' });
