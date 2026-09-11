const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = `docker exec root-mongo-1 mongosh -u admin -p "InstaMongo2026!" --authenticationDatabase admin marketplace --eval "
    var delBookings = db.bookings.deleteMany({});
    print('Deleted bookings:', delBookings.deletedCount);
    var delUser = db.users.deleteOne({ email: 'testbooking@instaimage.in' });
    print('Deleted test user:', delUser.deletedCount);
    var delNotifs = db.notifications.deleteMany({ message: { \\$regex: 'BKG-2026' } });
    print('Deleted test notifications:', delNotifs.deletedCount);
    print('DONE! Database is clean.');
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
