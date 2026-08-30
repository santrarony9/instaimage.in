const mongoose = require('mongoose');
require('dotenv').config({ path: './.env.production' });

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://admin:InstaMongo2026%21@135.125.9.81:27017/instaimage?authSource=admin';
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected correctly to server');

  const couponSchema = new mongoose.Schema({
    code: String,
    discountType: String,
    discountValue: Number,
    minOrderValue: Number,
    isActive: Boolean,
    validFrom: Date,
    validUntil: Date,
    currentUsageCount: Number,
    createdAt: Date,
    updatedAt: Date
  }, { collection: 'coupons' });

  const Coupon = mongoose.model('Coupon', couponSchema);
  const couponCode = 'WELCOME500';

  const existingCoupon = await Coupon.findOne({ code: couponCode });
  if (existingCoupon) {
    console.log('Coupon WELCOME500 already exists. Updating...');
    existingCoupon.discountType = 'FIXED';
    existingCoupon.discountValue = 500;
    existingCoupon.minOrderValue = 5000;
    existingCoupon.isActive = true;
    existingCoupon.validFrom = new Date();
    existingCoupon.validUntil = new Date(new Date().setFullYear(new Date().getFullYear() + 10));
    existingCoupon.updatedAt = new Date();
    await existingCoupon.save();
    console.log('Coupon updated.');
  } else {
    console.log('Creating new WELCOME500 coupon...');
    await Coupon.create({
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
  
  await mongoose.disconnect();
}

run().catch(console.dir);
