import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/streakin';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Academy Schema
const academySchema = new mongoose.Schema({
  name: { type: String, required: true },
  bannerText: { type: String, default: 'Scan to check in!' },
  bannerColor: { type: String, default: '#FF6B35' },
  basePoints: { type: Number, default: 10 },
}, { timestamps: true });

export const Academy = mongoose.models.Academy || mongoose.model('Academy', academySchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
  academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', default: null },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'superadmin'], required: true },
}, { timestamps: true });

export const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

// Student Schema
const studentSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  points: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastCheckinDate: { type: Date, default: null },
  awardedMilestoneIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Milestone' }],
}, { timestamps: true });

export const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

// CheckIn Schema
const checkInSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true },
  timestamp: { type: Date, default: Date.now, required: true },
});

// Compound index for fast "checked in today" lookups
checkInSchema.index({ studentId: 1, academyId: 1, timestamp: 1 });

export const CheckIn = mongoose.models.CheckIn || mongoose.model('CheckIn', checkInSchema);

// Milestone Schema
const milestoneSchema = new mongoose.Schema({
  academyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Academy', required: true },
  type: { type: String, enum: ['streak', 'points'], required: true },
  threshold: { type: Number, required: true },
  rewardDescription: { type: String, required: true },
}, { timestamps: true });

export const Milestone = mongoose.models.Milestone || mongoose.model('Milestone', milestoneSchema);

// Coupon Schema
const couponSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  milestoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone', required: true },
  code: { type: String, required: true, unique: true },
  issuedAt: { type: Date, default: Date.now },
  redeemed: { type: Boolean, default: false },
  redeemedAt: { type: Date, default: null },
});

export const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
