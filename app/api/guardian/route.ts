import { NextResponse } from 'next/server';

// ═══════════ API — حالة الـ Guardian Daemon ═══════════
// على Vercel: بيجيب من الداشبورد العام (tunnel)
// محلياً: بيقرا الملف مباشرة

const DASH = process.env.COMPANY_DASH_URL || '';

export async function GET() {
  // لو في COMPANY_DASH_URL → نستخدم الداشبورد (Vercel)
  if (DASH) {
    try {
      const res = await fetch(`${DASH}/api/guardian`, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
      const json = await res.json();
      if (json.success && json.data) {
        return NextResponse.json({ data: json.data });
      }
      return NextResponse.json(json, { status: res.status });
    } catch (e: any) {
      return NextResponse.json({ error: `guardian unreachable: ${e.message}` }, { status: 502 });
    }
  }

  // محلياً — اقرا الملف مباشرة
  try {
    const fs = require('fs');
    const path = require('path');
    const STATE_FILE = path.join(process.env.HOME || '/teamspace/studios/this_studio', '.hermes/scripts/guardian/state.json');
    if (!fs.existsSync(STATE_FILE)) {
      return NextResponse.json({ error: 'guardian state not found' }, { status: 404 });
    }
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    return NextResponse.json({ data: state });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
