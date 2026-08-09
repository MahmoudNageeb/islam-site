'use client';

// ═══════════ ميكاترونكس — المخزون + المشاريع + الحسابات ═══════════

import { useMemo, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';

// ─── المخزون (من كارت Lampatronics الحقيقي) ───
const KIT_GROUPS = [
  {
    name: '🚗 Smart Car',
    total: 1190,
    items: [
      { qty: 1, name: 'ESP32 30-Pin (WiFi+BT)', price: 325 },
      { qty: 1, name: 'Robot Smart Car 2WD', price: 330 },
      { qty: 1, name: 'L298N Motor Driver', price: 85 },
      { qty: 1, name: 'Caster Wheel 20mm', price: 30 },
      { qty: 1, name: 'Power Bank Module 18650', price: 100 },
      { qty: 1, name: 'Battery Holder 4×18650', price: 30 },
      { qty: 2, name: 'BMS TP4056', price: 60 },
      { qty: 1, name: 'Boost XL6009 5V', price: 95 },
      { qty: 1, name: 'Breadboard 830', price: 45 },
      { qty: 1, name: 'Jumper Wires 65', price: 75 },
      { qty: 2, name: 'Push Button 6×6', price: 5 },
      { qty: 1, name: 'Buzzer 5V', price: 10 },
    ],
  },
  {
    name: '📡 Sensors',
    total: 457,
    items: [
      { qty: 1, name: 'HC-SR04 Ultrasonic', price: 40 },
      { qty: 1, name: 'SG90 Servo (Radar)', price: 120 },
      { qty: 2, name: 'IR Obstacle Sensor', price: 50 },
      { qty: 1, name: 'DHT11 Temp/Humidity', price: 75 },
      { qty: 1, name: 'PIR Motion SR501', price: 45 },
      { qty: 1, name: 'LDR GL5528', price: 6 },
      { qty: 1, name: 'Relay 5V 1ch', price: 40 },
      { qty: 1, name: 'Flame Sensor 3pin', price: 25 },
      { qty: 1, name: 'Soil Moisture', price: 40 },
      { qty: 2, name: 'Tilt/Vibration SW-520D', price: 16 },
    ],
  },
  {
    name: '🏦 RFID Smart Piggy Bank',
    total: 355,
    items: [
      { qty: 1, name: 'RFID RC522 + Card + Tag', price: 200 },
      { qty: 1, name: 'SG90 Servo (Lid Lock)', price: 120 },
      { qty: 1, name: 'LCD 16×2 I2C', price: 35 },
    ],
  },
];

// ─── المشاريع (25+ من الـ kit) ───
const PROJECTS = [
  { icon: '🚗', name: 'Smart Car — 3 أوضاع', stars: 4, cat: 'سيارات', desc: 'إمالة اليد (تلفون) + WiFi + صوت — العربية بتكلم مع إسلام' },
  { icon: '🚗', name: 'Line Follower PID', stars: 3, cat: 'سيارات', desc: 'متابعة الخط بـ IR ×2' },
  { icon: '🚗', name: 'Obstacle Avoider', stars: 2, cat: 'سيارات', desc: 'يتجنب العوائق بـ HC-SR04' },
  { icon: '🚗', name: 'WiFi Robot', stars: 3, cat: 'سيارات', desc: 'تحكم من التلفون' },
  { icon: '🚗', name: 'Light Seeker', stars: 2, cat: 'سيارات', desc: 'يمشي ورا الضوء بـ LDR ×2' },
  { icon: '🚗', name: 'Edge Avoider', stars: 2, cat: 'سيارات', desc: 'يمنع السقوط من الطاولة' },
  { icon: '🚗', name: 'Maze Solver', stars: 4, cat: 'سيارات', desc: 'يحل المتاهة بـ HC-SR04 + IR' },
  { icon: '🌦️', name: 'IoT Weather Station', stars: 3, cat: 'IoT', desc: 'DHT11 + لوحة تحكم أونلاين' },
  { icon: '📡', name: 'Sonar Radar', stars: 3, cat: 'IoT', desc: 'SG90 + HC-SR04 على شاشة الكمبيوتر' },
  { icon: '🔥', name: 'Fire Alarm', stars: 2, cat: 'IoT', desc: 'Flame + Buzzer' },
  { icon: '🚨', name: 'Anti-Theft Alarm', stars: 2, cat: 'IoT', desc: 'PIR + Buzzer + إشعار WiFi — كل القطع موجودة!' },
  { icon: '🌱', name: 'Auto Plant Watering', stars: 2, cat: 'IoT', desc: 'Soil + Relay' },
  { icon: '💡', name: 'Smart Lighting', stars: 1, cat: 'IoT', desc: 'LDR + Relay — يفتح النور في الظلام' },
  { icon: '🏠', name: 'Smart Home', stars: 3, cat: 'IoT', desc: 'تحكم في الأجهزة من التلفون — Relay + WiFi' },
  { icon: '🌍', name: 'Earthquake Detector', stars: 2, cat: 'IoT', desc: 'SW-520 + Buzzer' },
  { icon: '🕐', name: 'NTP Internet Clock', stars: 2, cat: 'شاشات', desc: 'ESP32 + LCD' },
  { icon: '📏', name: 'Digital Distance Meter', stars: 2, cat: 'شاشات', desc: 'HC-SR04 + LCD' },
  { icon: '🌡️', name: 'Digital Thermometer', stars: 1, cat: 'شاشات', desc: 'DHT11 + LCD' },
  { icon: '🎮', name: 'LCD Game (Dino/Snake)', stars: 3, cat: 'شاشات', desc: 'ESP32 + LCD + Button' },
  { icon: '📊', name: 'Live Data Dashboard', stars: 4, cat: 'شاشات', desc: 'كل الحساسات + LCD' },
  { icon: '🅿️', name: 'Smart Parking', stars: 3, cat: 'تفاعلي', desc: 'عدّاد سيارات + بوابة سيرفو' },
  { icon: '🧼', name: 'Auto Soap Dispenser', stars: 2, cat: 'تفاعلي', desc: 'HC-SR04 + Relay' },
  { icon: '🔐', name: 'Secret Box', stars: 2, cat: 'تفاعلي', desc: 'باسورد + سيرفو' },
  { icon: '🎹', name: 'Mini Piano', stars: 1, cat: 'تفاعلي', desc: 'Buzzer + أزرار' },
  { icon: '📋', name: 'Attendance by Motion', stars: 2, cat: 'تفاعلي', desc: 'PIR + WiFi log' },
  { icon: '🏦', name: 'RFID Piggy Bank', stars: 3, cat: 'تفاعلي', desc: 'RC522 يفتح الغطاء لبطاقتك بس — غيرك: "ممنوع" + Buzzer' },
];

// ─── الحسابات الأساسية ───
const FORMULAS = [
  { icon: '⚡', name: 'قانون أوم', formula: 'V = I × R', desc: 'الجهد = التيار × المقاومة' },
  { icon: '🔋', name: 'بطاريات 18650', formula: '4× تسلسل = 14.8V', desc: 'عالي جداً للـ ESP32 — محتاج Buck. توازي = 3.7V + Boost (XL6009)' },
  { icon: '⚙️', name: 'L298N + موتور', formula: '7.4V → Buck → 5V', desc: '2S2P = بطاريتين تسلسل × خطين توازي' },
  { icon: '📐', name: 'عجلة الروبوت', formula: 'V = π × D × RPM', desc: 'سرعة العربة = قطر العجلة × لفة/دقيقة' },
  { icon: '🔍', name: 'HC-SR04 المسافة', formula: 'd = (t × 343) / 2', desc: 'الوقت × سرعة الصوت ÷ 2' },
  { icon: '🌡️', name: 'DHT11 القراءة', formula: '0-50°C ±2°C', desc: 'حرارة + رطوبة — دقة متوسطة كويسة للمشاريع' },
];

export default function MechaPage() {
  const [tab, setTab] = useState<'kit' | 'projects' | 'calc'>('projects');
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('الكل');

  const cats = useMemo(() => ['الكل', ...Array.from(new Set(PROJECTS.map((p) => p.cat)))], []);
  const filtered = useMemo(
    () =>
      PROJECTS.filter(
        (p) =>
          (cat === 'الكل' || p.cat === cat) &&
          (search === '' || p.name.includes(search) || p.desc.includes(search)),
      ),
    [cat, search],
  );

  const kitTotal = KIT_GROUPS.reduce((s, g) => s + g.total, 0);

  return (
    <div className="anim-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>🤖 ميكاترونكس</h1>
        <div className="row">
          <button className={`btn sm ${tab === 'projects' ? '' : 'ghost'}`} onClick={() => setTab('projects')}>🚀 المشاريع</button>
          <button className={`btn sm ${tab === 'kit' ? '' : 'ghost'}`} onClick={() => setTab('kit')}>🧰 المخزون</button>
          <button className={`btn sm ${tab === 'calc' ? '' : 'ghost'}`} onClick={() => setTab('calc')}>📐 الحسابات</button>
        </div>
      </div>
      <p style={{ color: 'var(--dim)', fontSize: 13, marginBottom: 18 }}>
        ورشة ESP32 متكاملة — 25+ مشروع تقدر تعملهم بقطعك الحالية
      </p>

      {tab === 'projects' && (
        <>
          <div className="row mb" style={{ gap: 8, flexWrap: 'wrap' }}>
            <input
              className="input"
              placeholder="🔍 دوّر على مشروع..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 260 }}
            />
            {cats.map((c) => (
              <button key={c} className={`btn sm ${cat === c ? '' : 'ghost'}`} onClick={() => setCat(c)}>
                {c}
              </button>
            ))}
          </div>
          <div className="grid cols-3">
            {filtered.map((p, i) => (
              <GlassCard key={i} glow={p.stars >= 4 ? 'gold' : 'primary'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 17, fontWeight: 800 }}>{p.icon} {p.name}</div>
                  <div style={{ color: 'var(--gold)', fontSize: 12, letterSpacing: 2 }}>
                    {'⭐'.repeat(p.stars)}
                  </div>
                </div>
                <div style={{ color: 'var(--dim)', fontSize: 12.5, marginTop: 6 }}>{p.desc}</div>
                <span className="badge info" style={{ marginTop: 8 }}>{p.cat}</span>
              </GlassCard>
            ))}
          </div>
        </>
      )}

      {tab === 'kit' && (
        <>
          <div className="grid cols-3 mb">
            <GlassCard title="🧰 قطع الورشة" glow="green">
              <div className="card-value">{KIT_GROUPS.reduce((s, g) => s + g.items.length, 0)}</div>
              <div className="card-sub">قطعة مختلفة</div>
            </GlassCard>
            <GlassCard title="💰 التكلفة الكلية" glow="gold">
              <div className="card-value">~{kitTotal.toLocaleString('ar-EG')}</div>
              <div className="card-sub">ج.م · من Lampatronics</div>
            </GlassCard>
            <GlassCard title="🔋 البطاريات" glow="accent">
              <div className="card-value">4 × 18650</div>
              <div className="card-sub">عندك بالفعل — مجاناً</div>
            </GlassCard>
          </div>

          {KIT_GROUPS.map((g) => (
            <GlassCard key={g.name} title={`${g.name} — ~${g.total.toLocaleString('ar-EG')} ج.م`} className="mb">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {g.items.map((it, i) => (
                  <div key={i} className="row spread" style={{ padding: '7px 2px', borderBottom: '1px solid rgba(99,138,255,.07)', fontSize: 13 }}>
                    <span>{it.name}</span>
                    <span style={{ color: 'var(--dim)', fontSize: 12 }}>
                      {it.qty} × {it.price.toLocaleString('ar-EG')} = <b style={{ color: 'var(--text)' }}>{(it.qty * it.price).toLocaleString('ar-EG')} ج.م</b>
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </>
      )}

      {tab === 'calc' && (
        <div className="grid cols-2">
          {FORMULAS.map((f, i) => (
            <GlassCard key={i} glow="accent">
              <div style={{ fontSize: 15, fontWeight: 800 }}>{f.icon} {f.name}</div>
              <div
                style={{
                  margin: '10px 0',
                  padding: '10px 14px',
                  background: 'var(--bg-card-solid)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 15,
                  direction: 'ltr',
                  textAlign: 'center',
                  color: 'var(--primary-light)',
                }}
              >
                {f.formula}
              </div>
              <div style={{ color: 'var(--dim)', fontSize: 12.5 }}>{f.desc}</div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
