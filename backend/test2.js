
const { Client } = require("ssh2");
const conn = new Client();
conn.on("ready", () => {
  const cmd = `docker exec root-mongo-1 mongosh instaimage -u admin -p "InstaMongo2026!" --authenticationDatabase admin --eval "print(\"Missing SKU: \", db.services.countDocuments({sku: null})); print(\"Total: \", db.services.countDocuments({}));"`;
  conn.exec(cmd, (err, stream) => {
    stream.on("data", (d) => { console.log(d.toString()); });
    stream.on("close", () => { conn.end(); });
  });
}).connect({ host: "135.125.9.81", port: 20064, username: "root", password: "SRhP8Rw_WJD8jZP2" });

