const { Client } = require('ssh2');

const password = 'SRhP8Rw_WJD8jZP2';
const host = '135.125.9.81';
const port = 20064;

const seedScript = `
const { MongoClient } = require('mongodb'); 
const bcrypt = require('bcrypt'); 
async function seedAdmin() { 
  const client = new MongoClient('mongodb://mongo:27017'); 
  await client.connect(); 
  const db = client.db('marketplace'); 
  const users = db.collection('users'); 
  const email = 'admin@instaimage.com'; 
  const existing = await users.findOne({ email }); 
  if (existing) { 
    console.log('Admin already exists'); 
  } else { 
    const salt = await bcrypt.genSalt(10); 
    const hash = await bcrypt.hash('admin123', salt); 
    await users.insertOne({ name: 'Super Admin', email, passwordHash: hash, role: 'ADMIN', isActive: true, createdAt: new Date(), updatedAt: new Date(), isDeleted: false }); 
    console.log('Admin created: admin@instaimage.com / admin123'); 
  } 
  await client.close(); 
} 
seedAdmin();
`;

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec('cd /root && docker compose exec -T api node -e "' + seedScript.replace(/"/g, '\\"') + '"', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: host,
  port: port,
  username: 'root',
  password: password,
  readyTimeout: 20000,
  algorithms: {
    serverHostKey: [ 'ssh-ed25519', 'ssh-rsa', 'ecdsa-sha2-nistp256' ]
  }
});
