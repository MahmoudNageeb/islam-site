'use client';

// ═══════════ Shell — الهيكل العام (v6 JARVIS) ═══════════
// Sidebar + TopBar + BootScreen + CommandPalette + FocusMode + HUD Toasts

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BootScreen from './BootScreen';
import CommandPalette from './CommandPalette';
import FocusMode from './FocusMode';
import { initTheme, toggleTheme } from '@/lib/theme';

const TITLES: Record<string, string> = {
  '/': 'الرئيسية',
  '/company': '🏢 الشركة',
  '/study': '📚 مهامي',
  '/mecha': '🤖 ميكاترونكس',
  '/control': '🎛️ التحكم',
  '/server': '📊 السيرفر',
  '/calendar': '🗓️ التقويم',
  '/dna': '🧬 DNA',
  '/profile': '🎮 الإنجازات',
  '/cinema': '🛰️ السينما',
  '/guardian': '🤖 الجارديان',
  '/settings': '⚙️ الإعدادات',
  '/notifications': '🔔 الإشعارات',
  '/ui-kit': '🎨 معرض المكونات',
};

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [turbo, setTurbo] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);

  // ─── الثيم العالمي: تطبيق الثيم المحفوظ عند فتح أي صفحة ───
  useEffect(() => {
    initTheme();
  }, []);

  // ─── عداد الإشعارات غير المقروءة ───
  useEffect(() => {
    const loadUnread = async () => {
      try {
        const r = await fetch('/api/notifications?unread=true');
        const d = await r.json();
        setUnread(d?.data?.unread ?? d?.unread ?? 0);
      } catch {}
    };
    loadUnread();
    const t = setInterval(loadUnread, 15000);
    return () => clearInterval(t);
  }, []);

  // ─── وضع التوربو: يقفل الـ animations + الخلفية الحية ───
  useEffect(() => {
    document.documentElement.setAttribute('data-turbo', turbo ? 'on' : 'off');
    try {
      localStorage.setItem('islam_turbo', turbo ? '1' : '0');
    } catch {}
  }, [turbo]);

  useEffect(() => {
    try {
      if (localStorage.getItem('islam_turbo') === '1') setTurbo(true);
    } catch {}
  }, []);

  // ─── Esc يقفل وضع التركيز ───
  useEffect(() => {
    if (!focusOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setFocusOpen(false); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [focusOpen]);

  const title = TITLES[pathname || '/'] || 'إسلام';

  return (
    <>
      <BootScreen />
      {!turbo && <div className="bg-live" />}
      <div className="hud-toast-wrap" id="hud-toasts" />
      <div className="app-shell">
        <Sidebar unreadCount={unread} />
        <main className="content">
          <TopBar
            title={title}
            unreadCount={unread}
            onBellClick={() => router.push('/notifications')}
            turbo={turbo}
            onTurboToggle={() => setTurbo(!turbo)}
            onFocusClick={() => setFocusOpen(true)}
          />
          {children}
        </main>
      </div>
      <CommandPalette
        onToggleTheme={() => toggleTheme()}
        onFocusMode={() => setFocusOpen(true)}
      />
      <FocusMode open={focusOpen} onClose={() => setFocusOpen(false)} taskTitle="جلسة تركيز" />
    </>
  );
}
