'use client';

// ═══════════ TopBar — شريط علوي: ساعة + حالة سيرفر + جرس إشعارات + ثيم ═══════════

import { useEffect, useState } from 'react';
import { fetchLiveSys, type LiveSys, getTheme, toggleTheme, type Theme } from '@/lib/theme';

interface TopBarProps {
  title?: string;
  unreadCount?: number;
  onBellClick?: () => void;
  turbo?: boolean;
  onTurboToggle?: () => void;
  onFocusClick?: () => void;
}

export default function TopBar({ title = 'إسلام', unreadCount = 0, onBellClick, turbo = false, onTurboToggle, onFocusClick }: TopBarProps) {
  const [now, setNow] = useState<string>('');
  const [sys, setSys] = useState<LiveSys>({});
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    setTheme(getTheme());
  }, []);

  const handleToggleTheme = () => {
    const next = toggleTheme();
    setTheme(next);
  };

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetchLiveSys().then(setSys);
    const t = setInterval(() => fetchLiveSys().then(setSys), 20000);
    return () => clearInterval(t);
  }, []);

  const allGood = (sys.services || []).every((s) => s.status !== 'down' && s.status !== 'error');

  return (
    <header className="topbar">
      <span className="topbar-title">{title}</span>
      <div className="topbar-spacer" />

      {/* وضع التركيز */}
      <button
        className="topbar-chip hide-sm"
        onClick={onFocusClick}
        title="وضع التركيز (F)"
      >
        🎯
      </button>

      {/* بحث موحد */}
      <button
        className="topbar-chip hide-sm"
        onClick={() => {
          const ev = new KeyboardEvent('keydown', { ctrlKey: true, key: 'k' });
          window.dispatchEvent(ev);
        }}
        title="البحث السريع (Ctrl+K)"
        style={{ gap: 6 }}
      >
        🔍 <span className="kbd-hint">Ctrl K</span>
      </button>

      {/* وضع التوربو */}
      <button
        className={`topbar-chip ${turbo ? 'chip-turbo' : ''}`}
        onClick={onTurboToggle}
        title={turbo ? 'التوربو شغال — اضغط للإيقاف' : 'وضع التوربو: أسرع + اقتصادي (يقفل الأنيميشن)'}
      >
        {turbo ? '⚡ توربو' : '🐢 عادي'}
      </button>

      {/* حالة السيرفر */}
      <div className="topbar-chip hide-sm" title="حالة الخدمات">
        <span className={allGood ? 'chip-good' : 'chip-bad'}>{allGood ? '●' : '○'}</span>
        {sys.cpu !== undefined && <span>CPU {Math.round(Number(sys.cpu))}%</span>}
        {sys.ram !== undefined && <span>RAM {Math.round(Number(sys.ram))}%</span>}
      </div>

      {/* الساعة */}
      <div className="topbar-chip hide-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
        🕐 {now}
      </div>

      {/* جرس الإشعارات */}
      <button className="bell-btn" onClick={onBellClick} title="الإشعارات">
        🔔
        {unreadCount > 0 && <span className="bell-dot">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>

      {/* الثيم — ناحية الشمال دايمًا في الهيدر على كل الموقع */}
      <button
        className="topbar-chip theme-toggle-btn"
        onClick={handleToggleTheme}
        title={theme === 'dark' ? 'التغيير للوضع النهاري' : 'التغيير للوضع الليلي'}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </header>
  );
}
