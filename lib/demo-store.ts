import bcrypt from 'bcryptjs';
import { endOfDay, startOfDay } from 'date-fns';

export interface DemoAcademy {
  _id: string;
  name: string;
  bannerText: string;
  bannerColor: string;
  basePoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DemoAdmin {
  _id: string;
  academyId: string | null;
  username: string;
  passwordHash: string;
  role: 'admin' | 'superadmin';
  createdAt: Date;
  updatedAt: Date;
}

export interface DemoStudent {
  _id: string;
  phone: string;
  name: string;
  points: number;
  currentStreak: number;
  longestStreak: number;
  lastCheckinDate: Date | null;
  awardedMilestoneIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DemoMilestone {
  _id: string;
  academyId: string;
  type: 'streak' | 'points';
  threshold: number;
  rewardDescription: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DemoCheckIn {
  _id: string;
  studentId: string;
  academyId: string;
  timestamp: Date;
}

export interface DemoCoupon {
  _id: string;
  studentId: string;
  milestoneId: string;
  code: string;
  brand?: string;
  pin?: string | null;
  issuedAt: Date;
  redeemed: boolean;
  redeemedAt: Date | null;
}

interface DemoStore {
  academies: DemoAcademy[];
  admins: DemoAdmin[];
  students: DemoStudent[];
  milestones: DemoMilestone[];
  checkIns: DemoCheckIn[];
  coupons: DemoCoupon[];
  counters: Record<string, number>;
}

declare global {
  // eslint-disable-next-line no-var
  var demoStore: DemoStore | undefined;
}

function createId(prefix: string, store: DemoStore) {
  store.counters[prefix] = (store.counters[prefix] || 0) + 1;
  return `${prefix}-${store.counters[prefix]}`;
}

function createSeedData(): DemoStore {
  const now = new Date();
  const academyId = 'academy-1';
  const studentId = 'student-1';
  const student2Id = 'student-2';
  const adminId = 'admin-1';
  const superadminId = 'superadmin-1';
  const milestone1Id = 'milestone-1';
  const milestone2Id = 'milestone-2';
  const milestone3Id = 'milestone-3';

  return {
    academies: [
      {
        _id: academyId,
        name: 'Momentum Sports Academy',
        bannerText: 'Build your streak! Check in daily for rewards.',
        bannerColor: '#FF6B35',
        basePoints: 10,
        createdAt: now,
        updatedAt: now,
      },
    ],
    admins: [
      {
        _id: adminId,
        academyId,
        username: 'admin1',
        passwordHash: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: superadminId,
        academyId: null,
        username: 'superadmin',
        passwordHash: bcrypt.hashSync('super123', 10),
        role: 'superadmin',
        createdAt: now,
        updatedAt: now,
      },
    ],
    students: [
      {
        _id: studentId,
        phone: '9876543210',
        name: 'Pawan',
        points: 48,
        currentStreak: 4,
        longestStreak: 4,
        lastCheckinDate: new Date(now.getTime() - 26 * 60 * 60 * 1000),
        awardedMilestoneIds: [milestone1Id],
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: student2Id,
        phone: '9548625856',
        name: 'Abhinav',
        points: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastCheckinDate: null,
        awardedMilestoneIds: [],
        createdAt: now,
        updatedAt: now,
      },
    ],
    milestones: [
      {
        _id: milestone1Id,
        academyId,
        type: 'streak',
        threshold: 3,
        rewardDescription: '10% off your next session',
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: milestone2Id,
        academyId,
        type: 'streak',
        threshold: 7,
        rewardDescription: 'Free training session',
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: milestone3Id,
        academyId,
        type: 'points',
        threshold: 100,
        rewardDescription: 'Exclusive merch discount',
        createdAt: now,
        updatedAt: now,
      },
    ],
    checkIns: [
      {
        _id: 'checkin-1',
        studentId,
        academyId,
        timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        _id: 'checkin-2',
        studentId,
        academyId,
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        _id: 'checkin-3',
        studentId,
        academyId,
        timestamp: new Date(now.getTime() - 26 * 60 * 60 * 1000),
      },
    ],
    coupons: [
      {
        _id: 'coupon-1',
        studentId,
        milestoneId: milestone1Id,
        code: 'MYNTRA-9742',
        brand: 'Myntra',
        pin: '4819263701548842',
        issuedAt: new Date(now.getTime() - 26 * 60 * 60 * 1000),
        redeemed: false,
        redeemedAt: null,
      },
      {
        _id: 'coupon-2',
        studentId,
        milestoneId: milestone2Id,
        code: 'ASICS-4108',
        brand: 'Asics',
        pin: '7328156491042876',
        issuedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
        redeemed: false,
        redeemedAt: null,
      },
    ],
    counters: {
      academy: 1,
      admin: 1,
      superadmin: 1,
      student: 2,
      milestone: 3,
      checkin: 3,
      coupon: 2,
    },
  };
}

function getStore() {
  if (!global.demoStore) {
    global.demoStore = createSeedData();
  }

  return global.demoStore;
}

export function findAdminByUsername(username: string) {
  return getStore().admins.find((admin) => admin.username === username) || null;
}

export function listAdmins() {
  return getStore().admins;
}

export function createAdmin(input: {
  username: string;
  passwordHash: string;
  academyId?: string | null;
}) {
  const store = getStore();
  const now = new Date();
  const admin: DemoAdmin = {
    _id: createId('admin', store),
    academyId: input.academyId || null,
    username: input.username,
    passwordHash: input.passwordHash,
    role: 'admin',
    createdAt: now,
    updatedAt: now,
  };
  store.admins.push(admin);
  return admin;
}

export function listAcademies() {
  return getStore().academies;
}

export function findAcademyById(academyId: string) {
  return getStore().academies.find((academy) => academy._id === academyId) || null;
}

export function createAcademy(input: {
  name: string;
  bannerText?: string;
  bannerColor?: string;
  basePoints?: number;
}) {
  const store = getStore();
  const now = new Date();
  const academy: DemoAcademy = {
    _id: createId('academy', store),
    name: input.name,
    bannerText: input.bannerText || 'Scan to check in!',
    bannerColor: input.bannerColor || '#FF6B35',
    basePoints: input.basePoints || 10,
    createdAt: now,
    updatedAt: now,
  };
  store.academies.push(academy);
  return academy;
}

export function updateAcademy(
  academyId: string,
  updates: Partial<Pick<DemoAcademy, 'bannerText' | 'bannerColor' | 'basePoints'>>
) {
  const academy = findAcademyById(academyId);
  if (!academy) return null;

  Object.assign(academy, updates, { updatedAt: new Date() });
  return academy;
}

export function listMilestonesByAcademy(academyId: string) {
  return getStore().milestones
    .filter((milestone) => milestone.academyId === academyId)
    .sort((a, b) => a.threshold - b.threshold);
}

export function findMilestoneById(milestoneId: string) {
  return getStore().milestones.find((milestone) => milestone._id === milestoneId) || null;
}

export function createMilestone(input: {
  academyId: string;
  type: 'streak' | 'points';
  threshold: number;
  rewardDescription: string;
}) {
  const store = getStore();
  const now = new Date();
  const milestone: DemoMilestone = {
    _id: createId('milestone', store),
    academyId: input.academyId,
    type: input.type,
    threshold: input.threshold,
    rewardDescription: input.rewardDescription,
    createdAt: now,
    updatedAt: now,
  };
  store.milestones.push(milestone);
  return milestone;
}

export function deleteMilestone(milestoneId: string) {
  const store = getStore();
  const index = store.milestones.findIndex((milestone) => milestone._id === milestoneId);
  if (index === -1) return false;
  store.milestones.splice(index, 1);
  return true;
}

export function findStudentByPhone(phone: string) {
  return getStore().students.find((student) => student.phone === phone) || null;
}

export function getDefaultStudent() {
  return getStore().students[0] || null;
}

export function findStudentById(studentId: string) {
  return getStore().students.find((student) => student._id === studentId) || null;
}

export function listStudents() {
  return getStore().students;
}

export function createStudent(input: { phone: string; name: string }) {
  const store = getStore();
  const now = new Date();
  const student: DemoStudent = {
    _id: createId('student', store),
    phone: input.phone,
    name: input.name,
    points: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastCheckinDate: null,
    awardedMilestoneIds: [],
    createdAt: now,
    updatedAt: now,
  };
  store.students.push(student);
  return student;
}

export function updateStudent(studentId: string, updates: Partial<DemoStudent>) {
  const student = findStudentById(studentId);
  if (!student) return null;

  Object.assign(student, updates, { updatedAt: new Date() });
  return student;
}

export function listCheckInsByAcademy(academyId: string) {
  return getStore().checkIns
    .filter((checkIn) => checkIn.academyId === academyId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function hasCheckInForDay(studentId: string, academyId: string, date: Date) {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  return getStore().checkIns.some(
    (checkIn) =>
      checkIn.studentId === studentId &&
      checkIn.academyId === academyId &&
      checkIn.timestamp >= dayStart &&
      checkIn.timestamp <= dayEnd
  );
}

export function createCheckIn(input: { studentId: string; academyId: string; timestamp: Date }) {
  const store = getStore();
  const checkIn: DemoCheckIn = {
    _id: createId('checkin', store),
    studentId: input.studentId,
    academyId: input.academyId,
    timestamp: input.timestamp,
  };
  store.checkIns.push(checkIn);
  return checkIn;
}

export function listCouponsByStudent(studentId: string) {
  return getStore().coupons
    .filter((coupon) => coupon.studentId === studentId)
    .sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime());
}

export function createCoupon(input: {
  studentId: string;
  milestoneId: string;
  code: string;
  brand?: string;
  pin?: string | null;
}) {
  const store = getStore();
  const coupon: DemoCoupon = {
    _id: createId('coupon', store),
    studentId: input.studentId,
    milestoneId: input.milestoneId,
    code: input.code,
    brand: input.brand,
    pin: input.pin || null,
    issuedAt: new Date(),
    redeemed: false,
    redeemedAt: null,
  };
  store.coupons.push(coupon);
  return coupon;
}
