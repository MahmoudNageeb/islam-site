import { NextRequest, NextResponse } from 'next/server';
import { appendEvent } from '../../../lib/ab';

export const dynamic = 'force-dynamic';

// POST /api/track — تسجيل أحداث A/B (impression / click / cta_view)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, variant, page = '/', uid } = body || {};

    if (!['impression', 'click', 'cta_view'].includes(event)) {
      return NextResponse.json({ success: false, error: 'invalid event' }, { status: 400 });
    }
    if (variant !== 'A' && variant !== 'B') {
      return NextResponse.json({ success: false, error: 'invalid variant' }, { status: 400 });
    }

    const ok = await appendEvent({ event, variant, page: String(page).slice(0, 200), uid: uid ? String(uid).slice(0, 64) : undefined });
    if (!ok) {
      return NextResponse.json({ success: false, error: 'storage failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, recorded: { event, variant, page } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'bad request: ' + e.message }, { status: 400 });
  }
}

// GET /api/track?limit=N — قراءة آخر الأحداث (للفحص السريع)
export async function GET(request: NextRequest) {
  const { readEvents } = await import('../../../lib/ab');
  const events = await readEvents();
  const limit = Number(request.nextUrl.searchParams.get('limit') || 20);
  return NextResponse.json({ success: true, count: events.length, events: events.slice(-limit) });
}
