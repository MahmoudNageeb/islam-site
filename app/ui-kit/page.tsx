'use client';

// ═══════════ UI Kit — معرض المكونات (تصميم v5) ═══════════

import GlassCard from '@/components/ui/GlassCard';
import ProgressBar from '@/components/ui/ProgressBar';

export default function UiKitPage() {
  return (
    <div className="anim-fade">
      <h1>🎨 معرض المكونات — Design System v5</h1>
      <p className="subtitle">كل عنصر بتصميمه الجديد: Deep Navy فخم + توهج بنفسجي محسوب</p>

      {/* البطاقات */}
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: '22px 0 10px' }}>📦 البطاقات (GlassCard)</h2>
      <div className="grid cols-4">
        <GlassCard title="🖥️ CPU" glow="primary">
          <div className="card-value">68%</div>
          <div className="card-sub">أساسي</div>
        </GlassCard>
        <GlassCard title="🧠 RAM" glow="accent">
          <div className="card-value">28%</div>
          <div className="card-sub">توهج سماوي</div>
        </GlassCard>
        <GlassCard title="💾 Disk" glow="green">
          <div className="card-value">9%</div>
          <div className="card-sub">أخضر</div>
        </GlassCard>
        <GlassCard title="💰 الميزانية" glow="gold">
          <div className="card-value">5,110</div>
          <div className="card-sub">ذهبي</div>
        </GlassCard>
      </div>

      {/* أشرطة التقدم */}
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: '26px 0 10px' }}>📊 أشرطة التقدم</h2>
      <GlassCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ProgressBar pct={68} label="مذاكرة فيزياء" status="working" />
          <ProgressBar pct={100} label="مراجعة إنجليزي" status="done" />
          <ProgressBar pct={35} label="مشروع ميكاترونكس" status="failed" />
          <ProgressBar pct={82} label="صغير" size="sm" />
        </div>
      </GlassCard>

      {/* الأزرار */}
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: '26px 0 10px' }}>🔘 الأزرار</h2>
      <GlassCard>
        <div className="row wrap">
          <button className="btn">أساسي</button>
          <button className="btn ghost">ثانوي</button>
          <button className="btn green">نجاح</button>
          <button className="btn red">خطر</button>
          <button className="btn gold">ذهبي</button>
          <button className="btn sm">صغير</button>
          <button className="btn lg">كبير</button>
        </div>
      </GlassCard>

      {/* الشارات */}
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: '26px 0 10px' }}>🏷️ الشارات</h2>
      <GlassCard>
        <div className="row wrap">
          <span className="badge info">معلومة</span>
          <span className="badge green">ناجح</span>
          <span className="badge red">خطأ</span>
          <span className="badge gold">تحذير</span>
          <span className="badge primary">أساسي</span>
        </div>
      </GlassCard>

      {/* الحقول */}
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: '26px 0 10px' }}>⌨️ الحقول</h2>
      <GlassCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input className="input" placeholder="اكتب حاجة..." />
          <textarea className="textarea" placeholder="وصف أطول..." rows={3} />
          <select className="input">
            <option>اختيار 1</option>
            <option>اختيار 2</option>
          </select>
        </div>
      </GlassCard>

      {/* الجدول */}
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: '26px 0 10px' }}>📋 الجدول</h2>
      <GlassCard>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>الموظف</th>
                <th>القسم</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>موظف 1</td><td>تطوير</td><td><span className="badge green">نشط</span></td></tr>
              <tr><td>موظف 2</td><td>بحث</td><td><span className="badge gold">مشغول</span></td></tr>
              <tr><td>موظف 3</td><td>تصميم</td><td><span className="badge red">متوقف</span></td></tr>
            </tbody>
          </table>
        </div>
      </GlassCard>

      <div className="mt">
        <button className="btn" onClick={() => window.location.href = '/'}>→ الرجوع للرئيسية</button>
      </div>
    </div>
  );
}
