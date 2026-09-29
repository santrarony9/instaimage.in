const { Client } = require('ssh2'); 
const conn = new Client(); 
conn.on('ready', () => { 
  conn.exec("docker restart root-nginx-1", (err, stream) => { 
    stream.on('data', d => process.stdout.write(d)); 
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => {
      conn.exec("docker ps", (err2, stream2) => {
        stream2.on('data', d => process.stdout.write(d)); 
        stream2.on('close', () => conn.end()); 
      });
    }); 
  }); 
}).connect({ host: '135.125.9.81', port: 20064, username: 'root', password: 'SRhP8Rw_WJD8jZP2' });
