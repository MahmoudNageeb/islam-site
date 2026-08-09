import { NextRequest, NextResponse } from 'next/server';
import { getRewards, updateRewards, getStats } from '@/lib/study-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ rewards: await await await getRewards(), stats: await getStats() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const rewards = updateRewards(body);
    return NextResponse.json({ rewards });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}