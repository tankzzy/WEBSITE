
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const crypto = require('crypto');

function createReferralCodeSeed(fullName = '', email = '') {
  const baseName = fullName.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 4);
  const baseEmail = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 4);
  const base = (baseName || baseEmail || 'LG').padEnd(4, 'X');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${base}${random}`;
}

async function generateUniqueReferralCode(fullName, email) {
  let referralCode = createReferralCodeSeed(fullName, email);
  while (await User.exists({ referralCode })) {
    referralCode = createReferralCodeSeed(fullName, email);
  }
  return referralCode;
}

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@tradilink.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin already exists!');
      console.log('Email:', adminEmail);
      console.log('Password: admin123 (or whatever you previously set)');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const newAdmin = new User({
      fullName: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      referralCode: await generateUniqueReferralCode('Admin User', adminEmail),
      mainBalance: 10000,
    });

    await newAdmin.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', 'admin123');
    console.log('Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
