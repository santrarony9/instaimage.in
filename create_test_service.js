const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  // Use the admin account to create a test product
  const cmd = `curl -s -X POST http://localhost/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@instaimage.in","password":"AdminPassword123!"}'`;
  
  conn.exec(cmd, (err, stream) => {
    let data = '';
    stream.on('data', d => data += d);
    stream.on('close', () => {
      console.log('Login Response:', data);
      const parsed = JSON.parse(data);
      const token = parsed.access_token;
      
      if (!token) {
        console.log('Failed to login as admin');
        conn.end();
        return;
      }

      // Create a test service
      const product = {
        name: "Test Photography Package",
        slug: "test-photography-" + Date.now(),
        description: "This is a test package to verify product creation works.",
        basePrice: 1500,
        category: "Photography",
        isApproved: true,
        isActive: true
      };

      const cmd2 = `curl -s -X POST http://localhost/api/v1/services -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '${JSON.stringify(product)}'`;
      conn.exec(cmd2, (err, stream2) => {
        let data2 = '';
        stream2.on('data', d => data2 += d);
        stream2.on('close', () => {
          console.log('Create Response:', data2);
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
