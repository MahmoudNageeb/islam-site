import { computeStats } from '../../lib/ab';

export const dynamic = 'force-dynamic';

// 🧪 لوحة نتائج A/B Testing — بتقرا أحداث حقيقية من .ab-data/events.jsonl
export default async function ABResultsPage() {
  const { stats, total, updatedAt } = await computeStats();

  const fmt = (n: number) => n.toLocaleString('en-US');
  const winner = stats[0].ctr === stats[1].ctr ? null : (stats[0].ctr > stats[1].ctr ? 'A' : 'B');
  const lift = winner && stats[0].impressions > 0 && stats[1].impressions > 0
    ? Math.abs(((stats[0].ctr - stats[1].ctr) / Math.max(stats[0].ctr, stats[1].ctr)) * 100).toFixed(1)
    : null;

  return (
    <>
      <h1>🧪 A/B Testing — النتائج</h1>
      <p className="subtitle">مقارنة نسختين من الصفحة الرئيسية — توزيع 50/50 تلقائي على الزوار</p>

      <div className="card mb">
        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div><span className="t-desc">إجمالي الأحداث المسجلة:</span> <strong>{fmt(total)}</strong></div>
          <div><span className="t-desc">آخر تحديث:</span> <strong>{updatedAt.slice(0, 19).replace('T', ' ')}</strong></div>
          <div><span className="t-desc">النسخة الرابحة حاليًا:</span> <strong style={{ color: 'var(--green)' }}>{winner ? `نسخة ${winner}` : '— لسه البيانات متكفّيش'}</strong></div>
          {lift && winner && <div><span className="t-desc">تحسين CTR:</span> <strong style={{ color: 'var(--green)' }}>+{lift}%</strong></div>}
        </div>
      </div>

      <table className="ab-table">
        <thead>
          <tr>
            <th>النسخة</th>
            <th>الوصف</th>
            <th>مشاهدات (Impressions)</th>
            <th>نقرات (Clicks)</th>
            <th>نسبة التحويل CTR</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s) => (
            <tr key={s.variant}>
              <td><strong>نسخة {s.variant}</strong></td>
              <td className="t-desc">{s.variant === 'A' ? 'الأصلية — عناوين متعددة' : 'المحسّنة — CTA واحد + Social Proof'}</td>
              <td>{fmt(s.impressions)}</td>
              <td>{fmt(s.clicks)}</td>
              <td><strong>{s.ctr > 0 ? (s.ctr * 100).toFixed(1) + '%' : '—'}</strong></td>
              <td>{winner === s.variant ? <span style={{ color: 'var(--green)' }}>🏆 رابحة</span> : <span className="t-desc">قيد المراقبة</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="card mt">
        <div className="t-title">📊 قراءة سريعة</div>
        <ul style={{ margin: '8px 0 0 18px', lineHeight: 1.9, color: 'var(--dim)' }}>
          <li>البيانات بتتسجل من زوار حقيقيين عبر <code>/api/track</code> — مش أرقام وهمية.</li>
          <li>كل زائر بيتثبت على نسخة واحدة (localStorage) عشان النتيجة تبقى نزيهة.</li>
          <li>للتجربة اليدوية: افتح الصفحة الرئيسية بـ <code>?variant=A</code> أو <code>?variant=B</code>.</li>
          <li>ملف الأحداث الخام: <code>islam_site/.ab-data/events.jsonl</code>.</li>
        </ul>
      </div>
    </>
  );
}
