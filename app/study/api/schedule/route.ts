import { NextRequest, NextResponse } from 'next/server';
import { getScheduleBlocks, createScheduleBlock, deleteScheduleBlock } from '@/lib/study-db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    return NextResponse.json({ blocks: await getScheduleBlocks(date) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.start_time || !body.end_time) {
      return NextResponse.json({ error: 'title و start_time و end_time مطلوبين' }, { status: 400 });
    }
    const block = await createScheduleBlock({
      title: body.title,
      date: body.date || new Date().toISOString().split('T')[0],
      start_time: body.start_time,
      end_time: body.end_time,
      color: body.color,
    });
    return NextResponse.json({ block }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });
    const ok = deleteScheduleBlock(Number(id));
    if (!ok) return NextResponse.json({ error: 'البلوك مش موجود' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}