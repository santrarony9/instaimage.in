const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const regCmd = `curl -s -X POST http://localhost/api/v1/auth/register-creator -H "Content-Type: application/json" -d '{"email":"test2@example.com","password":"Password123!","name":"Test Seller","role":"SELLER"}'`;
  
  conn.exec(regCmd, (err, stream) => {
    let data = '';
    stream.on('data', d => data += d);
    stream.on('close', () => {
      console.log('Register Response:', data);
      
      const loginCmd = `curl -s -X POST http://localhost/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"test2@example.com","password":"Password123!"}'`;
      conn.exec(loginCmd, (err, stream2) => {
        let data2 = '';
        stream2.on('data', d => data2 += d);
        stream2.on('close', () => {
          console.log('Login Response:', data2);
          const token = JSON.parse(data2).access_token;
          
          if (!token) {
            console.log('Failed to login');
            conn.end();
            return;
          }

          // Create a test service
          const product = {
            name: "Test Photography Package",
            slug: "test-photography-" + Date.now(),
            description: "This is a test package to verify product creation works.",
            basePrice: 1500,
            category: "Photography"
          };

          const cmd2 = `curl -s -X POST http://localhost/api/v1/services -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '${JSON.stringify(product)}'`;
          conn.exec(cmd2, (err, stream3) => {
            let data3 = '';
            stream3.on('data', d => data3 += d);
            stream3.on('close', () => {
              console.log('Create Response:', data3);
              conn.end();
            });
          });
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
