import { NextRequest, NextResponse } from 'next/server';
import { getNotes, createNote, updateNote, deleteNote } from '@/lib/study-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ notes: await getNotes() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, content, tags = null } = await req.json();
    if (!title || !content) return NextResponse.json({ error: 'title و content مطلوبين' }, { status: 400 });
    const note = createNote({ title, content, tags });
    return NextResponse.json({ note }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...patch } = await req.json();
    if (!id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });
    const note = updateNote(Number(id), patch);
    if (!note) return NextResponse.json({ error: 'الملاحظة مش موجودة' }, { status: 404 });
    return NextResponse.json({ note });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });
    const ok = deleteNote(Number(id));
    if (!ok) return NextResponse.json({ error: 'الملاحظة مش موجودة' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}