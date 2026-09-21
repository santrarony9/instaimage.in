const { Client } = require('ssh2');

const password = 'SRhP8Rw_WJD8jZP2';
const host = '135.125.9.81';
const port = 20064;

const resetScript = `
const { MongoClient } = require('mongodb'); 
const bcrypt = require('bcrypt');
async function resetAdmin() { 
  const client = new MongoClient('mongodb://admin:InstaMongo2026!@mongo:27017/marketplace?authSource=admin'); 
  await client.connect(); 
  const db = client.db('marketplace'); 
  
  const newPassword = 'Insta@Admin#2026!';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);
  
  const result = await db.collection('users').updateOne(
    { email: 'info.instaimage@gmail.com', role: 'ADMIN' },
    { \\$set: { passwordHash: hash } }
  );
  
  console.log('Admin password updated: ' + result.modifiedCount + ' doc(s) modified');
  console.log('New credentials => Email: info.instaimage@gmail.com | Password: ' + newPassword);
  
  await client.close(); 
} 
resetAdmin();
`;

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec('cd /root && docker compose exec -T api node -e "' + resetScript.replace(/"/g, '\\"') + '"', (err, stream) => {
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
