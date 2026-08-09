import { NextRequest, NextResponse } from 'next/server';

// Proxy عام: أي /api/* في موقع إسلام → الداشبورد الحقيقي (8081)
export const dynamic = 'force-dynamic';

const DASH = process.env.COMPANY_DASH_URL || 'http://127.0.0.1:8081';

export async function GET(request: NextRequest, context: any) {
  const path = (context?.params?.path || []).join('/');
  const qs = request.nextUrl.search;
  try {
    const res = await fetch(`${DASH}/api/${path}${qs}`, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
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
  try {
    const body = await request.text();
    const res = await fetch(`${DASH}/api/${path}${qs}`, {
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