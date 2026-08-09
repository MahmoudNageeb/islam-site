import { NextResponse } from 'next/server';
import { getAnalytics } from '@/lib/study-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ analytics: await getAnalytics() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}