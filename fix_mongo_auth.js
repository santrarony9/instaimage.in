const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const commands = `
    cd /root
    # Read password
    raw_pass=$(grep MONGO_INITDB_ROOT_PASSWORD .env | cut -d '=' -f2)
    # URL encode using node
    encoded_pass=$(node -e "console.log(encodeURIComponent('$raw_pass'))")
    
    # Check if MONGO_URI_PASSWORD already exists
    if ! grep -q "MONGO_URI_PASSWORD" .env; then
      echo "MONGO_URI_PASSWORD=$encoded_pass" >> .env
    else
      # Replace existing MONGO_URI_PASSWORD
      sed -i "s/^MONGO_URI_PASSWORD=.*/MONGO_URI_PASSWORD=$encoded_pass/" .env
    fi

    # Replace MONGODB_URI in docker-compose.yml
    sed -i 's/\\$\\{MONGO_INITDB_ROOT_PASSWORD:-changeit\\}/\\$\\{MONGO_URI_PASSWORD:-changeit\\}/g' docker-compose.yml

    # Restart services
    docker compose up -d
  `;
  
  conn.exec(commands, (err, stream) => {
    if (err) throw err;
    let data = '';
    stream.on('data', d => data += d.toString()).stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => {
      console.log('Fix completed:\n', data);
      conn.end();
    });
  });
}).on('error', (err) => console.error(err)).connect({
  host: '135.125.9.81',
  port: 20064,
  username: 'root',
  password: 'SRhP8Rw_WJD8jZP2',
  readyTimeout: 60000
});
