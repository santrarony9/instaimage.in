const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected to VPS');
  
  const commands = [
    // Run the workers image with a different command to list dist contents
    'docker run --rm root-workers ls -R /app/dist/',
  ];

  let idx = 0;
  function runNext() {
    if (idx >= commands.length) { conn.end(); return; }
    const cmd = commands[idx];
    console.log(`\n=== ${cmd} ===`);
    conn.exec(cmd, (err, stream) => {
      if (err) { console.error(err); idx++; runNext(); return; }
      let out = '';
      stream.on('data', (d) => { out += d.toString(); });
      stream.stderr.on('data', (d) => { out += d.toString(); });
      stream.on('close', () => { console.log(out.trim()); idx++; runNext(); });
    });
  }
  runNext();
}).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2',
});
