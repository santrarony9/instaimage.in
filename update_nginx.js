const { Client } = require('ssh2'); 
const conn = new Client(); 
conn.on('ready', () => { 
  const cmd = `cat << 'EOF' > /root/nginx.conf
events { worker_connections 1024; }

http {
    server {
        listen 80;

        location /api/ {
            proxy_pass http://api:3000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        location /v1/ {
            proxy_pass http://api:3000/v1/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
EOF

docker compose restart nginx
`; 
  conn.exec(cmd, (err, stream) => { 
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.on('close', () => { 
      console.log('Updated nginx.conf and restarted nginx'); 
      conn.end(); 
    }); 
  }); 
}).connect({ host: '135.125.9.81', port: 20064, username: 'root', password: 'SRhP8Rw_WJD8jZP2', readyTimeout: 10000 });
