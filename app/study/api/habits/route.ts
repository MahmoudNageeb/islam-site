import { NextRequest, NextResponse } from 'next/server';
import { getHabits, createHabit, updateHabit, deleteHabit, getHabitLogs, toggleHabitLog } from '@/lib/study-db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const habitId = searchParams.get('habit_id');
    const habits = await await getHabits();
    const logs = habitId ? await getHabitLogs(Number(habitId)) : [];
    return NextResponse.json({ habits, logs });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === 'toggle') {
      // toggle: { action: 'toggle', habit_id, date }
      const log = toggleHabitLog(Number(body.habit_id), body.date);
      return NextResponse.json({ log });
    }
    if (!body.name) return NextResponse.json({ error: 'name مطلوب' }, { status: 400 });
    const habit = createHabit(body);
    return NextResponse.json({ habit }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...patch } = await req.json();
    if (!id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });
    const habit = updateHabit(Number(id), patch);
    if (!habit) return NextResponse.json({ error: 'العادة مش موجودة' }, { status: 404 });
    return NextResponse.json({ habit });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });
    const ok = deleteHabit(Number(id));
    if (!ok) return NextResponse.json({ error: 'العادة مش موجودة' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}