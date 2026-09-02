const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const nginxConfig = `events {
    worker_connections 1024;
}

http {
    client_max_body_size 50M;
    
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    server {
        listen 80;

        add_header X-Content-Type-Options nosniff;
        add_header X-Frame-Options SAMEORIGIN;
        add_header X-XSS-Protection "1; mode=block";

        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            rewrite ^/api/(.*) /$1 break;
            proxy_pass http://api:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        location /v1/ {
            proxy_pass http://api:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        location /uploads/ {
            alias /app/uploads/;
            expires max;
            add_header Cache-Control public;
        }
    }
}`;

  conn.sftp((err, sftp) => {
    if (err) throw err;
    sftp.writeFile('/root/nginx.conf', nginxConfig, (err) => {
      if (err) throw err;
      conn.exec('cd /root && docker compose restart nginx', (err, stream) => {
        stream.on('data', d => process.stdout.write(d)).stderr.on('data', d => process.stderr.write(d));
        stream.on('close', () => {
          console.log('Nginx config updated and restarted');
          conn.end();
        });
      });
    });
  });
}).on('error', (err) => console.error(err)).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2',
  readyTimeout: 60000
});
