import { NextRequest, NextResponse } from 'next/server';
import { getAllSettings, setSetting } from '@/lib/study-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ settings: await getAllSettings() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'بيانات الإعدادات مطلوبة' }, { status: 400 });
    }
    for (const [key, value] of Object.entries(body)) {
      setSetting(key, String(value));
    }
    return NextResponse.json({ settings: await getAllSettings() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}