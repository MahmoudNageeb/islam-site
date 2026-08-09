import { NextRequest, NextResponse } from 'next/server';
import { getReminders, createReminder, deleteReminder, markReminderSent } from '@/lib/study-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ reminders: await getReminders() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === 'mark_sent') {
      markReminderSent(Number(body.id));
      return NextResponse.json({ ok: true });
    }
    if (!body.title || !body.datetime) {
      return NextResponse.json({ error: 'title و datetime مطلوبين' }, { status: 400 });
    }
    const reminder = createReminder(body);
    return NextResponse.json({ reminder }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });
    const ok = deleteReminder(Number(id));
    if (!ok) return NextResponse.json({ error: 'التذكير مش موجود' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}