/**
 * ============================================================================
 * DATABASE SEED SCRIPT
 * ============================================================================
 *
 * Purpose:
 * - Reset and seed the database with demo users/settings
 * - Use pre-save hooks to hash passwords
 *
 * WARNING:
 * - This script deletes all users and settings before seeding.
 * ============================================================================
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');
const Setting = require('../models/Setting.model');
const LoginAttempt = require('../models/LoginAttempt.model');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    // Clear existing data (destructive).
    await User.deleteMany();
    await Setting.deleteMany();
    await LoginAttempt.deleteMany();
    console.log('Database cleared...');

    // Create users with explicit roles for testing.
    const users = [
      {
        username: 'admin',
        password: 'admin123',
        email: 'admin@koola.com',
        phone: '0123456789',
        address: 'Hanoi, Vietnam',
        dateOfBirth: new Date('1990-01-01'),
        role: 'lv3'
      },
      {
        username: 'user_lv2',
        password: 'user123',
        email: 'user2@koola.com',
        phone: '0987654321',
        address: 'Ho Chi Minh, Vietnam',
        dateOfBirth: new Date('1995-05-15'),
        role: 'lv2'
      },
      {
        username: 'user_lv1',
        password: 'user123',
        email: 'user1@koola.com',
        phone: '0369852147',
        address: 'Da Nang, Vietnam',
        dateOfBirth: new Date('1998-08-20'),
        role: 'lv1'
      }
    ];

    // Use create() instead of insertMany() to trigger pre-save hooks.
    for (const userData of users) {
      await User.create(userData);
    }
    console.log('Users seeded...');

    // Create settings
    const settings = [
      {
        key: 'BLOCK_IP_DURATION',
        value: '30',
        description: 'Duration in seconds to block IP after failed login attempts'
      },
      {
        key: 'JWT_EXPIRES_IN',
        value: '2m',
        description: 'JWT token expiration time'
      }
    ];

    await Setting.insertMany(settings);
    console.log('Settings seeded...');

    console.log('Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
