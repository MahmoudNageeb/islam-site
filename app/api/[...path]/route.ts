import { NextRequest, NextResponse } from 'next/server';

// Proxy عام: أي /api/* في موقع إسلام → الداشبورد الحقيقي (8081)
// بيجيب عنوان الداشبورد الحي من /api/dash-url (بيقرا من السيرفر)
export const dynamic = 'force-dynamic';

const DASH = process.env.COMPANY_DASH_URL || 'http://127.0.0.1:8081';

// عنوان الداشبورد الحي (مخزن في الذاكرة — بيتحدث كل دقيقة)
let cachedDash = DASH;
let lastFetch = 0;

async function getDashUrl(): Promise<string> {
  // محلياً — استخدم الـ env مباشرة
  if (!process.env.COMPANY_DASH_URL || process.env.NODE_ENV === 'development') {
    return DASH;
  }
  // على Vercel — جرب اللينك الحي كل 60 ثانية
  const now = Date.now();
  if (now - lastFetch > 60000) {
    try {
      const self = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';
      const res = await fetch(`${self}/api/dash-url`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
      const json = await res.json();
      if (json.url && json.url.startsWith('http')) {
        cachedDash = json.url;
        lastFetch = now;
      }
    } catch {
      // استخدم الـ env var
    }
  }
  return cachedDash;
}

export async function GET(request: NextRequest, context: any) {
  const path = (context?.params?.path || []).join('/');
  const qs = request.nextUrl.search;
  const dash = await getDashUrl();
  try {
    const res = await fetch(`${dash}/api/${path}${qs}`, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'dashboard unreachable: ' + e.message }, { status: 502 });
  }
}

export async function POST(request: NextRequest, context: any) {
  const path = (context?.params?.path || []).join('/');
  const qs = request.nextUrl.search;
  const dash = await getDashUrl();
  try {
    const body = await request.text();
    const res = await fetch(`${dash}/api/${path}${qs}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'dashboard unreachable: ' + e.message }, { status: 502 });
  }
}
