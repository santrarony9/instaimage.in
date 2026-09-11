const { Client } = require('ssh2');

function tryConnect(attempt) {
  console.log('Connection attempt', attempt);
  const conn = new Client();
  conn.on('ready', () => {
    console.log('SSH Connected!');
    // Get logs AND restart all in one shot
    const cmd = [
      'docker logs --tail=60 root-api-1 2>&1',
    ].join(' && ');
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
    console.log('Attempt', attempt, 'failed:', err.message);
    if (attempt < 5) {
      setTimeout(() => tryConnect(attempt + 1), 10000);
    } else {
      process.exit(1);
    }
  }).connect({
    host: '135.125.9.81',
    port: 20064,
    username: 'root',
    password: 'SRhP8Rw_WJD8jZP2',
    readyTimeout: 30000
  });
}

setTimeout(() => tryConnect(1), 15000);
