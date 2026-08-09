import { NextRequest, NextResponse } from 'next/server';
import { getGoals, createGoal, updateGoal, deleteGoal } from '@/lib/study-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ goals: await getGoals() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title) return NextResponse.json({ error: 'title مطلوب' }, { status: 400 });
    const goal = createGoal(body);
    return NextResponse.json({ goal }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...patch } = await req.json();
    if (!id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });
    const goal = updateGoal(Number(id), patch);
    if (!goal) return NextResponse.json({ error: 'الهدف مش موجود' }, { status: 404 });
    return NextResponse.json({ goal });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });
    const ok = deleteGoal(Number(id));
    if (!ok) return NextResponse.json({ error: 'الهدف مش موجود' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}