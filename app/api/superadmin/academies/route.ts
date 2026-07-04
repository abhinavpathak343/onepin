import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { createAcademy } from '@/lib/demo-store';

const createAcademySchema = z.object({
  name: z.string().min(1).max(100),
  bannerText: z.string().max(200).optional(),
  bannerColor: z.string().optional(),
  basePoints: z.number().min(1).max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createAcademySchema.parse(body);

    const academy = createAcademy({
      name: parsed.name,
      bannerText: parsed.bannerText || 'Scan to check in!',
      bannerColor: parsed.bannerColor || '#FF6B35',
      basePoints: parsed.basePoints || 10,
    });

    return NextResponse.json({ success: true, academy });
  } catch (error) {
    console.error('Academy create error:', error);
    return NextResponse.json({ error: 'Creation failed' }, { status: 500 });
  }
}
