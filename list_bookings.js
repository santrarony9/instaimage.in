const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  // First, see all users and bookings with testbooking email
  const cmd = `docker exec root-mongo-1 mongosh -u admin -p "InstaMongo2026!" --authenticationDatabase admin marketplace --eval "
    var user = db.users.findOne({ email: 'testbooking@instaimage.in' });
    print('Test user:', JSON.stringify(user));
    var bookings = db.bookings.find({}).toArray();
    print('Total bookings:', bookings.length);
    bookings.forEach(b => print(b.bookingId, '|', b.customerName, '|', b.customerEmail || 'no email', '|', b.totalPrice));
  "`;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => {
      console.log('Output:\n', out);
      conn.end();
      process.exit(0);
    });
  });
}).on('error', err => {
  console.error('SSH Error:', err.message);
  process.exit(1);
}).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2',
  readyTimeout: 30000
});
