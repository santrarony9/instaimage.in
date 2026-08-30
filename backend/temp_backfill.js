
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

async function run() {
  const uri = 'mongodb://admin:InstaMongo2026%21@135.125.9.81:27017/instaimage?authSource=admin';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('instaimage');
    
    const services = await db.collection('services').find({ 
      $or: [
        { sku: { $exists: false } },
        { sku: '' },
        { sku: null }
      ]
    }).toArray();
    
    console.log(`Found ${services.length} services missing SKU`);
    
    for (const service of services) {
      const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
      const sku = 'SRV-' + randomStr;
      await db.collection('services').updateOne({ _id: service._id }, { $set: { sku } });
      console.log('Updated ' + service.name + ' with SKU ' + sku);
    }
    
    console.log('Done!');
  } finally {
    await client.close();
  }
}

run().catch(console.error);

