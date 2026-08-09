import { NextRequest, NextResponse } from 'next/server';

// ═══════════ API — عنوان الداشبورد الحي ═══════════
// بيقرا /tmp/company_url.txt على السيرفر — عشان اللينك يتحدث لو اتغير
// GET /api/dash-url → { url: "https://xxx.trycloudflare.com" }

const DASH = process.env.COMPANY_DASH_URL || '';
const URL_ENDPOINT = process.env.DASH_URL_ENDPOINT || '';

export async function GET() {
  // لو في endpoint خاص — استخدمه (بيجيب اللينك الحي)
  if (URL_ENDPOINT) {
    try {
      const res = await fetch(URL_ENDPOINT, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
      const json = await res.json();
      if (json.url) return NextResponse.json({ url: json.url });
    } catch {}
  }

  // fallback: الـ env var الثابت
  return NextResponse.json({ url: DASH });
}
