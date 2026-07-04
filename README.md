# StreakIn - Sports Academy Check-in System

A full-stack Next.js 14 application for sports academies to track student attendance, build daily streaks, and reward milestones.

## Features

- **Kiosk Display**: Full-screen QR code display that rotates every 15 seconds with a visual countdown ring
- **Mobile Scanner**: Shareable scan page that works without login - students just scan, enter phone number, and check in
- **Streak System**: Consecutive day tracking with a 36-hour grace window to maintain streaks
- **Points & Rewards**: Base points per check-in with streak bonuses, unlock coupons at milestones
- **Admin Dashboard**: Academy-specific admin panel to customize kiosk, manage milestones
- **Superadmin Dashboard**: Platform-wide management for multiple academies and admin accounts

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: MongoDB with Mongoose
- **Auth**: NextAuth.js (credentials provider) - for admins only
- **UI**: Tailwind CSS + shadcn/ui + Framer Motion
- **QR Scanning**: html5-qrcode

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file:

```env
# MongoDB (required)
MONGODB_URI=mongodb://localhost:27017/streakin

# NextAuth (required)
NEXTAUTH_SECRET=your-random-secret-key-at-least-32-characters
JWT_SECRET=your-jwt-secret-key-for-qr-tokens

# Optional: Production MongoDB
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/streakin
```

### 3. Seed Database

Run the seed script to create demo data:

```bash
npm run seed
```

This creates:
- Demo academy: "Momentum Sports Academy"
- Admin account: `admin1` / `admin123`
- Superadmin account: `superadmin` / `super123`
- 3 sample milestones (3-day streak, 7-day streak, 100 points)

### 4. Start Development Server

```bash
npm run dev
```

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin1` | `admin123` |
| Superadmin | `superadmin` | `super123` |

## Routes

### Public Routes

- `/` - Landing page with feature overview
- `/scan` - Mobile QR scanner for check-ins (works standalone, shareable URL)
- `/scan?academyId=XYZ` - Pre-filled academy context for testing
- `/rewards` - Student lookup by phone number to view streaks and coupons
- `/kiosk/[academyId]` - Full-screen kiosk display with rotating QR code
- `/login` - Admin login page

### Protected Routes

- `/admin` - Academy admin dashboard (role: admin)
- `/superadmin` - Platform admin dashboard (role: superadmin)

## How It Works

### QR Token System

The kiosk generates HMAC-signed QR codes containing:
```
{
  academyId: "academy-object-id",
  token: "signed-hash",
  window: 123456,  // 15-second time window
  expiresAt: timestamp
}
```

The scanner validates:
1. Token signature matches expected HMAC
2. Time window is current or immediately prior (prevents stale scans)

### Check-in Flow

1. Student scans kiosk QR code on phone
2. Enters phone number (and name if new student)
3. System validates token and creates check-in record
4. Updates streak with 36-hour grace window
5. Awards points with streak bonus (>3 days = +2 per day)
6. Checks for milestone achievements and generates coupons

### Streak Logic

- Consecutive days build streak
- 36-hour grace window: if last check-in was within 36 hours, streak continues
- Longest streak is tracked for bragging rights

### Points Calculation

```
pointsEarned = basePoints + streakBonus
where streakBonus = currentStreak > 3 ? (currentStreak - 3) * 2 : 0
```

Example: Day 5 streak with 10 base points = 10 + (5-3)*2 = 14 points

### Milestones

Admins can create streak-based or points-based milestones:
- Streak milestone: Awarded when currentStreak >= threshold
- Points milestone: Awarded when totalPoints >= threshold

Each milestone can only be awarded once per student.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/checkin` | POST | Process student check-in |
| `/api/student` | POST | Look up student by phone |
| `/api/qr/[academyId]` | GET | Generate QR token |
| `/api/academy/[academyId]` | GET | Get academy details |
| `/api/admin` | GET | Admin dashboard data |
| `/api/admin/academy` | PATCH | Update academy settings |
| `/api/admin/milestones` | POST | Create milestone |
| `/api/admin/milestones/[id]` | DELETE | Delete milestone |
| `/api/superadmin` | GET | Superadmin dashboard data |
| `/api/superadmin/academies` | POST | Create academy |
| `/api/superadmin/admins` | POST | Create admin account |

## Deployment

Build for production:

```bash
npm run build
```

The app can be deployed to Vercel, Netlify, or any Node.js hosting platform. Ensure environment variables are set.

## License

MIT
