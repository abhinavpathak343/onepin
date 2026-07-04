import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { findMilestoneById, findStudentByPhone, getDefaultStudent, listCouponsByStudent } from '@/lib/demo-store';

const lookupSchema = z.object({
  phone: z.string().min(10).max(15),
});

function buildStudentResponse(student: NonNullable<ReturnType<typeof findStudentByPhone>>) {
  const formattedCoupons = listCouponsByStudent(student._id).map((coupon) => {
    const milestone = findMilestoneById(coupon.milestoneId);
    return {
      code: coupon.code,
      brand: coupon.brand || 'Partner Reward',
      pin: coupon.pin || null,
      rewardDescription: milestone?.rewardDescription || 'Reward',
      issuedAt: coupon.issuedAt,
      redeemed: coupon.redeemed,
      redeemedAt: coupon.redeemedAt,
    };
  });

  return {
    success: true,
    student: {
      name: student.name,
      phone: student.phone,
      points: student.points,
      currentStreak: student.currentStreak,
      longestStreak: student.longestStreak,
    },
    coupons: formattedCoupons,
  };
}

export async function GET() {
  try {
    const student = getDefaultStudent();

    if (!student) {
      return NextResponse.json({
        success: false,
        error: 'No demo student available.',
      }, { status: 404 });
    }

    return NextResponse.json(buildStudentResponse(student));
  } catch (error) {
    console.error('Student demo fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to load demo rewards.',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = lookupSchema.parse(body);

    const student = findStudentByPhone(parsed.phone);

    if (!student) {
      return NextResponse.json({
        success: false,
        error: 'No account found with this phone number. Check in at an academy to get started!',
      }, { status: 404 });
    }

    return NextResponse.json(buildStudentResponse(student));
  } catch (error) {
    console.error('Student lookup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Lookup failed. Please try again.',
    }, { status: 500 });
  }
}
