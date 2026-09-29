const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './backend/.env.production' });

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://admin:InstaMongo2026%21@135.125.9.81:27017/instaimage?authSource=admin';
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected correctly to server');
    
    const db = client.db('instaimage');
    const coupons = db.collection('coupons');

    const couponCode = 'WELCOME500';

    const existingCoupon = await coupons.findOne({ code: couponCode });
    if (existingCoupon) {
      console.log('Coupon WELCOME500 already exists. Updating it to match new criteria...');
      await coupons.updateOne(
        { code: couponCode },
        {
          $set: {
            discountType: 'FIXED',
            discountValue: 500,
            minOrderValue: 5000,
            isActive: true,
            validFrom: new Date(),
            validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 10)), // Valid for 10 years
            updatedAt: new Date()
          }
        }
      );
      console.log('Coupon updated.');
    } else {
      console.log('Creating new WELCOME500 coupon...');
      await coupons.insertOne({
        code: couponCode,
        discountType: 'FIXED',
        discountValue: 500,
        minOrderValue: 5000,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 10)),
        currentUsageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Coupon created successfully.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
