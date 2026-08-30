const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

async function getUrls() {
  const s3 = new S3Client({
    region: 'eu-central-003',
    endpoint: 'https://s3.eu-central-003.backblazeb2.com',
    credentials: {
      accessKeyId: 'f87ad6faa8b3',
      secretAccessKey: '0031697847c74883ae60204a0d5fd410f394a59adf'
    }
  });

  const bucketName = 'instaimage-bucket';
  const data = await s3.send(new ListObjectsV2Command({ Bucket: bucketName }));
  
  if (data.Contents) {
    const urls = data.Contents.map(c => `https://${bucketName}.s3.eu-central-003.backblazeb2.com/${c.Key}`);
    const fs = require('fs');
    fs.writeFileSync('urls.json', JSON.stringify(urls));
    console.log('Saved to urls.json!');
  }
}

getUrls().catch(console.error);
