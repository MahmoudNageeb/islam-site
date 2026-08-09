import { NextRequest, NextResponse } from 'next/server';
import { getLinks, createLink, deleteLink } from '@/lib/study-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ links: await getLinks() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, url, description = null, tags = null } = await req.json();
    if (!name || !url) return NextResponse.json({ error: 'name و url مطلوبين' }, { status: 400 });
    const link = createLink({ name, url, description, tags });
    return NextResponse.json({ link }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });
    const ok = deleteLink(Number(id));
    if (!ok) return NextResponse.json({ error: 'الرابط مش موجود' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}