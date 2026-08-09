import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// ═══════════ API الإشعارات — مركز الإشعارات الموحد ═══════════
// الملف: ~/.hermes/company/notifications.json
// GET  /api/notifications?unread=true → { unread: N }
// GET  /api/notifications → { items: [...] }
// POST /api/notifications → إضافة إشعار (يستخدمه النظام)

const NOTIF_FILE = path.join(process.env.HOME || '/root', '.hermes', 'company', 'notifications.json');
const NOTIF_FILE_FALLBACK = '/teamspace/studios/this_studio/.hermes/company/notifications.json';

function readNotifs(): any[] {
  try {
    const f = (fs.existsSync(NOTIF_FILE) && NOTIF_FILE !== NOTIF_FILE_FALLBACK) ? NOTIF_FILE : NOTIF_FILE_FALLBACK;
    if (!fs.existsSync(f)) return [];
    const raw = fs.readFileSync(f, 'utf-8');
    const d = JSON.parse(raw);
    return Array.isArray(d) ? d : d.items || [];
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const unreadOnly = url.searchParams.get('unread') === 'true';

  const items = readNotifs().slice(-100).reverse();

  if (unreadOnly) {
    const unread = items.filter((n) => !n.read).length;
    return NextResponse.json({ data: { unread } });
  }

  return NextResponse.json({ data: { items } });
}

export async function POST(req: NextRequest) {
  try {
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

    // احتفظ بآخر 500 إشعار
    const trimmed = items.slice(-500);
    const f = (fs.existsSync(NOTIF_FILE) && NOTIF_FILE !== NOTIF_FILE_FALLBACK) ? NOTIF_FILE : NOTIF_FILE_FALLBACK;
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, JSON.stringify({ items: trimmed }, null, 2));

    return NextResponse.json({ success: true, data: { id: Date.now() } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
