import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ═══════════ API — حالة الـ Guardian Daemon ═══════════

const STATE_FILE = path.join(process.env.HOME || '/teamspace/studios/this_studio', '.hermes/scripts/guardian/state.json');

export async function GET() {
  try {
    if (!fs.existsSync(STATE_FILE)) {
      return NextResponse.json({ error: 'guardian state not found' }, { status: 404 });
    }
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    return NextResponse.json({ data: state });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
