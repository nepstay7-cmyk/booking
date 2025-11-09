const User = require('../models/User');
const mongoose = require('mongoose');
require('dotenv').config();

// Create a company admin user
async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nepal-hotel-booking');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nepalhotelbooking.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    const admin = await User.create({
      name: 'Company Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'companyAdmin',
      isVerified: true
    });

    console.log('Admin user created successfully:');
    console.log('Email:', admin.email);
    console.log('Password:', adminPassword);
    console.log('Role:', admin.role);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error creating admin:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createAdmin();
}

module.exports = createAdmin;




