const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

async function getUrls() {
  const s3 = new S3Client({
    region: 'eu-central-003',
    endpoint: 'https://s3.eu-central-003.backblazeb2.com',
    credentials: {
      accessKeyId: '003f87ad6faa8b30000000001',
      secretAccessKey: 'K003vEFQR18xOs9csl+DM3WftdyUS+8'
    }
  });

  const bucketName = 'instaimage-bucket';
  const data = await s3.send(new ListObjectsV2Command({ Bucket: bucketName }));
  
  if (data.Contents) {
    const urls = data.Contents.map(c => `https://${bucketName}.s3.eu-central-003.backblazeb2.com/${c.Key}`);
    const fs = require('fs');
    fs.writeFileSync('urls.json', JSON.stringify(urls));
    console.log(`Saved ${urls.length} URLs to urls.json!`);
  } else {
    console.log('No contents found.');
  }
}

getUrls().catch(console.error);
