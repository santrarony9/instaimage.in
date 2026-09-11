const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected!');
  // The uploaded .ts source file is not compiled - run from pre-compiled dist  
  // The container runs from dist/, so the .ts file upload doesn't matter
  // The issue is likely the container needs to be rebuilt since it uses compiled JS
  // Let us restore the original dist file first and restart
  conn.exec('docker logs root-api-1 2>&1 | tail -50', (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => {
      console.log('Container logs:\n', out);
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
