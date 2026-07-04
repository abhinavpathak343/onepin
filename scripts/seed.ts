import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, Academy, Admin, Milestone, Student, CheckIn, Coupon } from '../lib/db';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/streakin';

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);

  console.log('Clearing existing data...');
  await Academy.deleteMany({});
  await Admin.deleteMany({});
  await Milestone.deleteMany({});
  await Student.deleteMany({});
  await CheckIn.deleteMany({});
  await Coupon.deleteMany({});

  console.log('Creating demo academy...');
  const academy = await Academy.create({
    name: 'Momentum Sports Academy',
    bannerText: 'Build your streak! Check in daily for rewards.',
    bannerColor: '#FF6B35',
    basePoints: 10,
  });

  console.log('Creating admin accounts...');
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const superadminPasswordHash = await bcrypt.hash('super123', 10);

  await Admin.create({
    academyId: academy._id,
    username: 'admin1',
    passwordHash: adminPasswordHash,
    role: 'admin',
  });

  await Admin.create({
    academyId: null,
    username: 'superadmin',
    passwordHash: superadminPasswordHash,
    role: 'superadmin',
  });

  console.log('Creating demo milestones...');
  await Milestone.create({
    academyId: academy._id,
    type: 'streak',
    threshold: 3,
    rewardDescription: '10% off your next session',
  });

  await Milestone.create({
    academyId: academy._id,
    type: 'streak',
    threshold: 7,
    rewardDescription: 'Free training session',
  });

  await Milestone.create({
    academyId: academy._id,
    type: 'points',
    threshold: 100,
    rewardDescription: 'Exclusive merch discount',
  });

  console.log('Seed completed!');
  console.log('\nDemo credentials:');
  console.log('Admin: admin1 / admin123');
  console.log('Superadmin: superadmin / super123');
  console.log('\nAcademy ID:', academy._id.toString());

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
