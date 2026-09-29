const { Client } = require('ssh2');

const password = 'SRhP8Rw_WJD8jZP2';
const host = '135.125.9.81';
const port = 20064;

const resetScript = `
const { MongoClient } = require('mongodb'); 
async function resetBookings() { 
  const client = new MongoClient('mongodb://admin:InstaMongo2026!@mongo:27017/marketplace?authSource=admin'); 
  await client.connect(); 
  const db = client.db('marketplace'); 
  
  console.log('Clearing bookings...');
  const resBookings = await db.collection('bookings').deleteMany({});
  console.log('Deleted ' + resBookings.deletedCount + ' bookings.');
  
  console.log('Clearing payments...');
  const resPayments = await db.collection('payments').deleteMany({});
  console.log('Deleted ' + resPayments.deletedCount + ' payments.');

  console.log('Clearing notifications...');
  const resNotifications = await db.collection('notifications').deleteMany({});
  console.log('Deleted ' + resNotifications.deletedCount + ' notifications.');

  await client.close(); 
} 
resetBookings();
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
