import { NextRequest, NextResponse } from 'next/server';

// ═══════════ API الإشعارات — مركز الإشعارات الموحد ═══════════
// على Vercel: بيجيب من الداشبورد العام (tunnel)
// محلياً: بيقرا الملف مباشرة

const DASH = process.env.COMPANY_DASH_URL || '';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const unreadOnly = url.searchParams.get('unread') === 'true';

  // على Vercel → الداشبورد
  if (DASH) {
    try {
      const res = await fetch(`${DASH}/api/notifications${unreadOnly ? '?unread=true' : ''}`, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
      const json = await res.json();
      return NextResponse.json(json);
    } catch (e: any) {
      return NextResponse.json({ data: { items: [], unread: 0 } });
    }
  }

  // محلياً
  try {
    const fs = require('fs');
    const path = require('path');
    const NOTIF_FILE = path.join(process.env.HOME || '/root', '.hermes', 'company', 'notifications.json');
    const NOTIF_FILE_FALLBACK = '/teamspace/studios/this_studio/.hermes/company/notifications.json';
    const readNotifs = () => {
      try {
        const f = (fs.existsSync(NOTIF_FILE) && NOTIF_FILE !== NOTIF_FILE_FALLBACK) ? NOTIF_FILE : NOTIF_FILE_FALLBACK;
        if (!fs.existsSync(f)) return [];
        const raw = fs.readFileSync(f, 'utf-8');
        const d = JSON.parse(raw);
        return Array.isArray(d) ? d : d.items || [];
      } catch { return []; }
    };

    const items = readNotifs().slice(-100).reverse();
    if (unreadOnly) {
      return NextResponse.json({ data: { unread: items.filter((n: any) => !n.read).length } });
    }
    return NextResponse.json({ data: { items } });
  } catch (e: any) {
    return NextResponse.json({ data: { items: [] } });
  }
}

export async function POST(req: NextRequest) {
  // على Vercel → الداشبورد (لو متاح)
  if (DASH) {
    try {
      const body = await req.json();
      const res = await fetch(`${DASH}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });
      const json = await res.json();
      return NextResponse.json(json, { status: res.status });
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 502 });
    }
  }

  // محلياً
  try {
    const fs = require('fs');
    const path = require('path');
    const NOTIF_FILE = path.join(process.env.HOME || '/root', '.hermes', 'company', 'notifications.json');
    const NOTIF_FILE_FALLBACK = '/teamspace/studios/this_studio/.hermes/company/notifications.json';
    const readNotifs = () => {
      try {
        const f = (fs.existsSync(NOTIF_FILE) && NOTIF_FILE !== NOTIF_FILE_FALLBACK) ? NOTIF_FILE : NOTIF_FILE_FALLBACK;
        if (!fs.existsSync(f)) return [];
        const raw = fs.readFileSync(f, 'utf-8');
        const d = JSON.parse(raw);
        return Array.isArray(d) ? d : d.items || [];
      } catch { return []; }
    };

    const body = await req.json();
    const { title, body: bodyText, type = 'info', icon = '📌' } = body;
    const items = readNotifs();
    items.push({
      id: Date.now(),
      title: title || 'إشعار',
      body: bodyText || '',
      type,
      icon,
      time: new Date().toISOString(),
      read: false,
    });
    const trimmed = items.slice(-500);
    const f = (fs.existsSync(NOTIF_FILE) && NOTIF_FILE !== NOTIF_FILE_FALLBACK) ? NOTIF_FILE : NOTIF_FILE_FALLBACK;
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, JSON.stringify({ items: trimmed }, null, 2));
    return NextResponse.json({ success: true, data: { id: Date.now() } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
