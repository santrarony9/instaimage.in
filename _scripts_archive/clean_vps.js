const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected! Removing Instamojo env vars...');
  const cmd = `
    cd /root && \
    sed -i '/INSTAMOJO_API_KEY/d' /root/.env && \
    sed -i '/INSTAMOJO_AUTH_TOKEN/d' /root/.env && \
    echo "=== Restarting API container ===" && \
    docker compose up -d --force-recreate api && \
    echo "=== DONE ==="
  `;
  
  conn.exec(cmd, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stdout.write(d.toString()));
    stream.on('close', () => {
      console.log('\nFinished.');
      conn.end();
    });
  });
}).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2',
  readyTimeout: 30000
});
