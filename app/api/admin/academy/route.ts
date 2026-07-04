import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { updateAcademy } from '@/lib/demo-store';

const updateSchema = z.object({
  academyId: z.string(),
  bannerText: z.string().max(200).optional(),
  bannerColor: z.string().optional(),
  basePoints: z.number().min(1).max(100).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateSchema.parse(body);

    if (parsed.academyId !== session.user.academyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates: any = {};
    if (parsed.bannerText !== undefined) updates.bannerText = parsed.bannerText;
    if (parsed.bannerColor !== undefined) updates.bannerColor = parsed.bannerColor;
    if (parsed.basePoints !== undefined) updates.basePoints = parsed.basePoints;

    const academy = updateAcademy(parsed.academyId, updates);

    if (!academy) {
      return NextResponse.json({ error: 'Academy not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, academy });
  } catch (error) {
    console.error('Academy update error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
