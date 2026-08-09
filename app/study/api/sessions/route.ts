import { NextRequest, NextResponse } from 'next/server';
import { getSessions, createSession, getStats, deleteSession } from '@/lib/study-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ sessions: await getSessions(), stats: await getStats() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { type = 'work', duration_seconds, planned_seconds, task_id = null } = await req.json();
    if (!duration_seconds || !planned_seconds) {
      return NextResponse.json({ error: 'duration_seconds و planned_seconds مطلوبين' }, { status: 400 });
    }
    const date = new Date().toISOString().slice(0, 10);
    const session = createSession({ type, duration_seconds, planned_seconds, task_id, date });
    return NextResponse.json({ session }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });
    const ok = deleteSession(Number(id));
    if (!ok) return NextResponse.json({ error: 'الجلسة مش موجودة' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}