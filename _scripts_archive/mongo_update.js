const { Client } = require('ssh2'); 
const conn = new Client(); 
conn.on('ready', () => { 
  const updateCmd = `db.settings.updateOne({ key: 'officeLocations' }, { \\$set: { value: [ { name: 'Kolkata HQ (Shrachi Centre)', coordinates: [88.3629044, 22.5504506] } ] } }, { upsert: true })`;
  const mongoCmd = `docker exec root-mongo-1 mongosh -u admin -p "InstaMongo2026!" --authenticationDatabase admin instaimage --eval "${updateCmd}"`;
  conn.exec(mongoCmd, (err, stream) => { 
    stream.on('data', d => console.log(d.toString())); 
    stream.stderr.on('data', d => console.error(d.toString())); 
    stream.on('close', () => conn.end()); 
  }); 
}).connect({ host: '135.125.9.81', port: 20064, username: 'root', password: 'SRhP8Rw_WJD8jZP2' });
