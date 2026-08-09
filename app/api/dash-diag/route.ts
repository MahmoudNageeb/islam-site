import { NextResponse } from 'next/server';

// ═══════════ API — تشخيص اتصال Vercel بالداشبورد ═══════════
export const dynamic = 'force-dynamic';

export async function GET() {
  const results: any = {};

  // 1. dash-url الحالي
  try {
    const self = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';
    const res = await fetch(`${self}/api/dash-url`, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
    const json = await res.json();
    results.dashUrl = json;
  } catch (e: any) {
    results.dashUrlError = e.message;
  }

  // 2. جرّب fetch مباشر على اللينك
  const url = results.dashUrl?.url;
  if (url) {
    try {
      const res = await fetch(`${url}/api/health`, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
      results.directFetch = { status: res.status, body: (await res.text()).slice(0, 150) };
    } catch (e: any) {
      results.directFetchError = e.message;
    }
  }

  // 3. DNS check
  try {
    const r = await fetch(`https://dns.google/resolve?name=${new URL(url || 'https://example.com').hostname}&type=A`);
    const d = await r.json();
    results.dns = d.Answer?.map((a: any) => a.data).slice(0, 3) || [];
  } catch (e: any) {
    results.dnsError = e.message;
  }

  return NextResponse.json(results);
}
