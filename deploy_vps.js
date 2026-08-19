const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected to VPS');
  const cmd = `cd ~ && rm -rf temp_repo && git clone https://github.com/santrarony9/insta-image-platform.git temp_repo && cp -a temp_repo/backend/* ~/backend/ && rm -rf temp_repo && cd ~/backend && docker-compose up -d --build api`;
  conn.exec(cmd, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    let out = '';
    stream.on('data', (d) => { out += d.toString(); });
    stream.stderr.on('data', (d) => { out += d.toString(); });
    stream.on('close', () => { console.log(out.trim()); conn.end(); });
  });
}).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2',
});
