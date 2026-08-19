const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected to VPS');
  
  const commands = [
    // Raw curl output to see exactly what Nginx returns for /v1/services
    'curl -sv http://localhost:20065/v1/services 2>&1 | head -30',
    // Direct from inside docker to API
    'docker compose exec -T nginx curl -s http://api:3000/v1/services 2>/dev/null | head -c 300',
    // Check nginx config
    'cat /root/nginx.conf',
  ];

  let idx = 0;
  function runNext() {
    if (idx >= commands.length) { conn.end(); return; }
    const cmd = commands[idx];
    console.log(`\n=== CMD ${idx+1} ===`);
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
