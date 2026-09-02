const { Client } = require('ssh2');
const fix = () => {
  const conn = new Client();
  conn.on('ready', () => {
    process.stdout.write('+');
    const cmd = `
      pkill -9 node
      while true; do pkill -9 node; sleep 2; done &
      LOOP_PID=$!
      docker update --restart=no root-api-1 root-workers-1 root-frontend-1
      docker rm -f root-api-1 root-workers-1 root-frontend-1
      kill -9 $LOOP_PID
    `;
    conn.exec(cmd, (err, stream) => {
      if (err) { conn.end(); return; }
      stream.on('close', () => {
        console.log('\n[SUCCESS] Server fixed!');
        process.exit(0);
      });
    });
  }).on('error', (err) => {
    process.stdout.write('.');
    setTimeout(fix, 500);
  }).connect({
    host: '135.125.9.81',
    port: 20064,
    username: 'root',
    password: 'SRhP8Rw_WJD8jZP2',
    readyTimeout: 3000
  });
};
fix();
