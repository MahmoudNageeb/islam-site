import { promises as fs } from 'fs';
import path from 'path';

// ═══ نظام A/B Testing — إسلام (Growth Manager) ═══
// ملف الأحداث: JSONL (سطر لكل حدث) — سهل يتحلل ويترجع فيه
export const DATA_DIR = path.join(process.cwd(), '.ab-data');
export const EVENTS_FILE = path.join(DATA_DIR, 'events.jsonl');

export type ABEvent = {
  ts: string;          // ISO timestamp
  variant: 'A' | 'B';
  event: 'impression' | 'click' | 'cta_view';
  page: string;        // الصفحة اللي حصل فيها الحدث
  uid?: string;        // معرف الزائر (اختياري — للـ dedupe)
};

export async function appendEvent(e: Omit<ABEvent, 'ts'>): Promise<boolean> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const line = JSON.stringify({ ...e, ts: new Date().toISOString() }) + '\n';
    await fs.appendFile(EVENTS_FILE, line, 'utf8');
    return true;
  } catch {
    return false;
  }
}

export async function readEvents(): Promise<ABEvent[]> {
  try {
    const raw = await fs.readFile(EVENTS_FILE, 'utf8');
    return raw.split('\n').filter(Boolean).map((l) => {
      try {
        return JSON.parse(l) as ABEvent;
      } catch {
        return null;
      }
    }).filter((x): x is ABEvent => x !== null);
  } catch {
    return [];
  }
}

// ═══ التحليل — إحصائيات لكل نسخة ═══
export type VariantStats = {
  variant: 'A' | 'B';
  impressions: number;
  clicks: number;
  ctr: number;         // نسبة التحويل (نقرات/مشاهدات)
};

export async function computeStats(): Promise<{ stats: VariantStats[]; total: number; updatedAt: string }> {
  const events = await readEvents();
  const byVariant: Record<'A' | 'B', { impressions: number; clicks: number }> = {
    A: { impressions: 0, clicks: 0 },
    B: { impressions: 0, clicks: 0 },
  };

  for (const e of events) {
    if (!byVariant[e.variant]) continue;
    if (e.event === 'impression') byVariant[e.variant].impressions++;
    else if (e.event === 'click') byVariant[e.variant].clicks++;
  }

  const stats: VariantStats[] = (['A', 'B'] as const).map((v) => {
    const s = byVariant[v];
    return {
      variant: v,
      impressions: s.impressions,
      clicks: s.clicks,
      ctr: s.impressions > 0 ? +(s.clicks / s.impressions).toFixed(4) : 0,
    };
  });

  return {
    stats,
    total: events.length,
    updatedAt: new Date().toISOString(),
  };
}
