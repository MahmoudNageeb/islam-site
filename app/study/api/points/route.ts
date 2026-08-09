import { NextRequest, NextResponse } from 'next/server';
import { addPoints, getPointsLog, getRewards } from '@/lib/study-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ rewards: await await await await getRewards(), log: await await getPointsLog() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { amount, reason } = await req.json();
    if (!amount || !reason) return NextResponse.json({ error: 'amount و reason مطلوبين' }, { status: 400 });
    const entry = await addPoints(Number(amount), reason);
    return NextResponse.json({ entry, rewards: await await await await getRewards() }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}