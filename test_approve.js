const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  // Use the admin account to approve the test product
  const cmd = `cd /root && docker compose exec mongo mongosh instaimage -eval "db.services.updateOne({ slug: /test-photography/ }, { \\$set: { isApproved: true } })"`;
  
  conn.exec(cmd, (err, stream) => {
    let data = '';
    stream.on('data', d => data += d);
    stream.on('close', () => {
      console.log('Approve Response:', data);
      
      // Check if it shows up in public endpoint
      const checkCmd = `curl -s http://localhost/api/v1/services`;
      conn.exec(checkCmd, (err, stream2) => {
        let data2 = '';
        stream2.on('data', d => data2 += d);
        stream2.on('close', () => {
          console.log('Public Services:', data2);
          conn.end();
        });
      });
    });
  });
}).on('error', err => console.error(err)).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2',
  readyTimeout: 60000
});
