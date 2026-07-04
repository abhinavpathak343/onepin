import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  findAcademyById,
  listAcademies,
  listAdmins,
  listCheckInsByAcademy,
  listCouponsByStudent,
  listStudents,
} from '@/lib/demo-store';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const academies = listAcademies();
    const admins = listAdmins();
    const students = listStudents();
    const academyStats = academies.map((academy) => ({
      ...academy,
      checkIns: listCheckInsByAcademy(academy._id).length,
    }));
    const totalCheckIns = academyStats.reduce((sum, academy) => sum + academy.checkIns, 0);
    const totalCoupons = students.reduce((sum, student) => sum + listCouponsByStudent(student._id).length, 0);

    return NextResponse.json({
      stats: {
        totalAcademies: academies.length,
        totalAdmins: admins.length,
        totalCheckIns,
        totalCoupons,
        totalStudents: students.length,
      },
      academies: academyStats,
      admins: admins.map((admin) => ({
        _id: admin._id,
        username: admin.username,
        role: admin.role,
        academyName: admin.academyId ? findAcademyById(admin.academyId)?.name || null : null,
        createdAt: admin.createdAt,
      })),
    });
  } catch (error) {
    console.error('Superadmin dashboard error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
