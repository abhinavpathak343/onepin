import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createCheckIn,
  createCoupon,
  createStudent,
  findAcademyById,
  findStudentByPhone,
  listMilestonesByAcademy,
  updateStudent,
  hasCheckInForDay,
} from '@/lib/demo-store';
import { validateQRToken, QRData, generateCouponCode } from '@/lib/qr-token';
import { subHours } from 'date-fns';

const checkinSchema = z.object({
  qrData: z.object({
    academyId: z.string(),
    token: z.string(),
    window: z.number(),
    expiresAt: z.number(),
  }),
  phone: z.string().min(10).max(15),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkinSchema.parse(body);

    const qrValidation = validateQRToken(parsed.qrData as QRData);

    if (!qrValidation.valid || !qrValidation.academyId) {
      return NextResponse.json({
        success: false,
        error: qrValidation.error || 'Invalid QR code',
      }, { status: 400 });
    }

    const academy = findAcademyById(qrValidation.academyId);

    if (!academy) {
      return NextResponse.json({
        success: false,
        error: 'Academy not found',
      }, { status: 404 });
    }

    // Find or create student
    let student = findStudentByPhone(parsed.phone);

    if (!student) {
      if (!parsed.name) {
        return NextResponse.json({
          success: false,
          needName: true,
          message: 'New student - please provide your name',
        }, { status: 200 });
      }

      student = createStudent({
        phone: parsed.phone,
        name: parsed.name,
      });
    }

    // Check if already checked in today at this academy
    const existingCheckin = hasCheckInForDay(student._id, academy._id, new Date());

    if (existingCheckin) {
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        student: {
          name: student.name,
          points: student.points,
          currentStreak: student.currentStreak,
          longestStreak: student.longestStreak,
        },
      }, { status: 200 });
    }

    // Calculate streak
    const now = new Date();
    const lastCheckin = student.lastCheckinDate;

    let newStreak = 1;

    if (lastCheckin) {
      const thirtySixHoursAgo = subHours(now, 36);
      if (lastCheckin >= thirtySixHoursAgo) {
        newStreak = student.currentStreak + 1;
      }
    }

    const newLongestStreak = Math.max(student.longestStreak, newStreak);

    // Calculate points with streak bonus
    const streakBonus = newStreak > 3 ? (newStreak - 3) * 2 : 0;
    const pointsEarned = academy.basePoints + streakBonus;
    const newPoints = student.points + pointsEarned;

    // Update student
    const awardedMilestoneIds = [...student.awardedMilestoneIds];
    const newCoupons: { code: string; rewardDescription: string }[] = [];

    // Check for new milestones
    const milestones = listMilestonesByAcademy(academy._id).filter(
      (milestone) => !awardedMilestoneIds.includes(milestone._id)
    );

    for (const milestone of milestones) {
      let qualifies = false;

      if (milestone.type === 'streak' && newStreak >= milestone.threshold) {
        qualifies = true;
      } else if (milestone.type === 'points' && newPoints >= milestone.threshold) {
        qualifies = true;
      }

      if (qualifies) {
        const couponCode = generateCouponCode();
        createCoupon({
          studentId: student._id,
          milestoneId: milestone._id,
          code: couponCode,
        });
        awardedMilestoneIds.push(milestone._id);
        newCoupons.push({
          code: couponCode,
          rewardDescription: milestone.rewardDescription,
        });
      }
    }

    updateStudent(student._id, {
      points: newPoints,
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastCheckinDate: now,
      awardedMilestoneIds,
    });

    // Create check-in record
    createCheckIn({
      studentId: student._id,
      academyId: academy._id,
      timestamp: now,
    });

    return NextResponse.json({
      success: true,
      student: {
        name: student.name,
        points: newPoints,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        pointsEarned,
        streakBonus,
      },
      newCoupons,
      academy: {
        name: academy.name,
      },
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json({
      success: false,
      error: 'Check-in failed. Please try again.',
    }, { status: 500 });
  }
}
