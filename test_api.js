const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `curl -s -X POST http://localhost:20065/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"Password123!"}'`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let data = '';
    stream.on('data', d => data += d);
    stream.on('close', () => {
      console.log('Login Response:', data);
      
      const parsed = JSON.parse(data);
      const token = parsed.access_token;
      
      if (!token) {
        // If login failed, just try to create a user first
        console.log('Login failed, registering test seller...');
        const regCmd = `curl -s -X POST http://localhost:20065/api/v1/auth/register-creator -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"Password123!","name":"Test Seller","role":"SELLER"}'`;
        
        conn.exec(regCmd, (err, stream2) => {
          let data2 = '';
          stream2.on('data', d => data2 += d);
          stream2.on('close', () => {
            console.log('Register Response:', data2);
            const token2 = JSON.parse(data2).access_token;
            testProduct(token2);
          });
        });
        return;
      }
      testProduct(token);
    });
  });

  function testProduct(token) {
    if (!token) {
      console.log('No token');
      conn.end();
      return;
    }
    const product = {
      name: "Test Product",
      slug: "test-product-" + Date.now(),
      description: "Test description",
      basePrice: 100,
      category: "Photography"
    };

    const cmd2 = `curl -s -X POST http://localhost:20065/api/v1/services -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '${JSON.stringify(product)}'`;
    conn.exec(cmd2, (err, stream2) => {
      let data2 = '';
      stream2.on('data', d => data2 += d);
      stream2.on('close', () => {
        console.log('Create Response:', data2);
        conn.end();
      });
    });
  }
}).on('error', err => console.error(err)).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2',
  readyTimeout: 60000
});
