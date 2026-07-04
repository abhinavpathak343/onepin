import { NextRequest, NextResponse } from 'next/server';
import { startOfDay, endOfDay } from 'date-fns';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  findAcademyById,
  findStudentById,
  listCheckInsByAcademy,
  listMilestonesByAcademy,
} from '@/lib/demo-store';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const academyId = session.user.academyId;
    if (!academyId) {
      return NextResponse.json({ error: 'Academy not found' }, { status: 404 });
    }

    const academy = findAcademyById(academyId);

    if (!academy) {
      return NextResponse.json({ error: 'Academy not found' }, { status: 404 });
    }

    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const allAcademyCheckins = listCheckInsByAcademy(academyId);
    const todayCheckins = allAcademyCheckins.filter(
      (checkIn) => checkIn.timestamp >= startOfToday && checkIn.timestamp <= endOfToday
    );
    const uniqueStudentsToday = new Set(todayCheckins.map((checkIn) => checkIn.studentId));
    const uniqueStudentsAllTime = new Set(allAcademyCheckins.map((checkIn) => checkIn.studentId));
    const milestones = listMilestonesByAcademy(academyId);
    const recentCheckins = allAcademyCheckins.slice(0, 20);

    return NextResponse.json({
      academy: {
        _id: academy._id,
        name: academy.name,
        bannerText: academy.bannerText,
        bannerColor: academy.bannerColor,
        basePoints: academy.basePoints,
      },
      stats: {
        todayCheckins: todayCheckins.length,
        todayUniqueStudents: uniqueStudentsToday.size,
        totalCheckins: allAcademyCheckins.length,
        totalUniqueStudents: uniqueStudentsAllTime.size,
      },
      todayCheckins: todayCheckins.map((checkIn) => {
        const student = findStudentById(checkIn.studentId);
        return {
          _id: checkIn._id,
          studentName: student?.name || 'Unknown',
          studentPhone: student?.phone || 'Unknown',
          timestamp: checkIn.timestamp,
        };
      }),
      milestones: milestones.map((milestone) => ({
        _id: milestone._id,
        type: milestone.type,
        threshold: milestone.threshold,
        rewardDescription: milestone.rewardDescription,
      })),
      recentCheckins: recentCheckins.map((checkIn) => {
        const student = findStudentById(checkIn.studentId);
        return {
          _id: checkIn._id,
          studentName: student?.name || 'Unknown',
          studentPhone: student?.phone || 'Unknown',
          timestamp: checkIn.timestamp,
        };
      }),
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
