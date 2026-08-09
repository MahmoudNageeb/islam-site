'use client';

// ═══════════ PomodoroView — بومودورو (شغل 25 / راحة 5 / طويلة 15) ═══════════

import { useEffect, useRef, useState } from 'react';

interface Props {
  workTime: number;
  breakTime: number;
  longBreakTime: number;
  sessionsCount: number;
  onSessionComplete: (type: string, duration: number) => Promise<void>;
  onSaveSettings: (k: string, v: string) => void;
}

type TimerType = 'work' | 'break' | 'longBreak';

export default function PomodoroView({ workTime, breakTime, longBreakTime, sessionsCount, onSessionComplete, onSaveSettings }: Props) {
  const [type, setType] = useState<TimerType>('work');
  const [seconds, setSeconds] = useState(workTime * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionsInRow = useRef(0);

  const durations: Record<TimerType, number> = {
    work: workTime * 60,
    break: breakTime * 60,
    longBreak: longBreakTime * 60,
  };

  const setTimerType = (t: TimerType) => {
    setType(t);
    setSeconds(durations[t]);
    setRunning(false);
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            // جلسة خلصت
            const finishedType = type;
            const planned = durations[finishedType];
            if (finishedType === 'work') {
              sessionsInRow.current += 1;
              onSessionComplete('work', planned);
              // بعد الشغل → راحة (أو طويلة بعد 4 جلسات)
              if (sessionsInRow.current >= 4) {
                sessionsInRow.current = 0;
                setType('longBreak');
                setSeconds(longBreakTime * 60);
              } else {
                setType('break');
                setSeconds(breakTime * 60);
              }
            } else {
              onSessionComplete(finishedType, planned);
              setType('work');
              setSeconds(workTime * 60);
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      return () => clearInterval(intervalRef.current!);
    }
  }, [running, type, durations, workTime, breakTime, longBreakTime, onSessionComplete]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const pct = (seconds / durations[type]) * 100;

  const labels: Record<TimerType, string> = {
    work: '🍅 شغل',
    break: '☕ راحة قصيرة',
    longBreak: '🌴 راحة طويلة',
  };

  return (
    <div>
      {/* أنواع المؤقت */}
      <div className="row" style={{ gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        <button className={`btn sm ${type === 'work' ? '' : 'ghost'}`} onClick={() => setTimerType('work')}>🍅 شغل {workTime}د</button>
        <button className={`btn sm ${type === 'break' ? '' : 'ghost'}`} onClick={() => setTimerType('break')}>☕ راحة {breakTime}د</button>
        <button className={`btn sm ${type === 'longBreak' ? '' : 'ghost'}`} onClick={() => setTimerType('longBreak')}>🌴 طويلة {longBreakTime}د</button>
      </div>

      {/* العداد */}
      <div className="card" style={{ textAlign: 'center', padding: '36px 20px' }}>
        <div style={{ fontSize: 13, color: 'var(--dim)', letterSpacing: 1, marginBottom: 10 }}>{labels[type]}</div>
        <div style={{
          fontSize: 'clamp(56px, 12vw, 96px)', fontWeight: 800, fontFamily: 'var(--font-mono)',
          color: type === 'work' ? 'var(--primary)' : type === 'longBreak' ? '#ffd740' : '#00e676',
          textShadow: `0 0 30px ${type === 'work' ? 'rgba(0,229,255,0.3)' : type === 'longBreak' ? 'rgba(255,215,64,0.3)' : 'rgba(0,230,118,0.3)'}`,
          fontVariantNumeric: 'tabular-nums', lineHeight: 1.2,
        }}>
          {mm}:{ss}
        </div>
        <div style={{ width: 'min(320px, 80vw)', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', margin: '18px auto' }}>
          <div style={{
            height: '100%', width: `${pct}%`, borderRadius: 4,
            background: 'linear-gradient(90deg, #00e5ff, #2979ff)', transition: 'width 1s linear',
          }} />
        </div>
        <div className="row" style={{ justifyContent: 'center', gap: 10 }}>
          <button className="btn" onClick={() => setRunning(!running)}>
            {running ? '⏸️ إيقاف مؤقت' : '▶️ ابدأ'}
          </button>
          <button className="btn ghost" onClick={() => { setSeconds(durations[type]); setRunning(false); }}>🔄 إعادة</button>
        </div>
      </div>

      {/* جلسات النهاردة */}
      <div className="card mt" style={{ textAlign: 'center', padding: '16px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#00e5ff', fontFamily: 'var(--font-mono)' }}>{sessionsCount}</div>
        <div style={{ fontSize: 12, color: 'var(--dim)' }}>جلسة بومودورو مكتملة</div>
      </div>

      {/* إعدادات المؤقت */}
      <div className="card mt">
        <b style={{ fontSize: 14 }}>⚙️ إعدادات المؤقت</b>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 12 }}>
          {([
            ['work_time', 'شغل (دقيقة)', workTime],
            ['break_time', 'راحة (دقيقة)', breakTime],
            ['long_break_time', 'طويلة (دقيقة)', longBreakTime],
          ] as const).map(([key, label, val]) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 11.5, color: 'var(--dim)', marginBottom: 5 }}>{label}</label>
              <input
                type="number" min={1} max={120}
                value={val}
                onChange={(e) => onSaveSettings(key, e.target.value)}
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: 8,
                  border: '1px solid var(--border)', background: 'var(--bg-soft)',
                  color: 'var(--text)', fontFamily: 'var(--font-mono)', textAlign: 'center', outline: 'none',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
