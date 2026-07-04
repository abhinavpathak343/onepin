import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { createAdmin, findAdminByUsername } from '@/lib/demo-store';

const createAdminSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(4),
  academyId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createAdminSchema.parse(body);

    const existing = findAdminByUsername(parsed.username);
    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(parsed.password, 10);

    const admin = createAdmin({
      username: parsed.username,
      passwordHash,
      academyId: parsed.academyId || null,
    });

    return NextResponse.json({ success: true, admin: { _id: admin._id, username: admin.username } });
  } catch (error) {
    console.error('Admin create error:', error);
    return NextResponse.json({ error: 'Creation failed' }, { status: 500 });
  }
}
