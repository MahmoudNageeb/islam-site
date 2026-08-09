'use client';

// ═══════════ Sidebar — شريط التنقل الجانبي ═══════════
// Desktop: يمين ثابت | Mobile: Bottom Nav

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', icon: '🏠', label: 'الرئيسية' },
  { href: '/company', icon: '🏢', label: 'الشركة' },
  { href: '/study', icon: '📚', label: 'مهامي' },
  { href: '/mecha', icon: '🤖', label: 'ميكاترونكس' },
  { href: '/control', icon: '🎛️', label: 'التحكم' },
  { href: '/server', icon: '📊', label: 'السيرفر' },
  { href: '/calendar', icon: '🗓️', label: 'التقويم' },
  { href: '/dna', icon: '🧬', label: 'DNA' },
  { href: '/profile', icon: '🎮', label: 'الإنجازات' },
  { href: '/cinema', icon: '🛰️', label: 'السينما' },
  { href: '/guardian', icon: '🤖', label: 'الجارديان' },
  { href: '/settings', icon: '⚙️', label: 'الإعدادات' },
];

interface SidebarProps {
  unreadCount?: number;
}

export default function Sidebar({ unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="sidebar">
      <div className="brand">
        <span className="brand-icon">⚡</span>
        <div>
          <div className="brand-name">إسلام</div>
          <div className="brand-sub">Islam Site v4</div>
        </div>
      </div>

      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
        // 🔔 عداد غير المقروء على جرس الإشعارات في صفحة الإعدادات؟ لا — على الرئيسية فقط
        const badge = item.href === '/' && unreadCount > 0 ? unreadCount : undefined;
        return (
          <Link key={item.href} href={item.href} className={`nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
            {badge !== undefined && <span className="nav-badge">{badge}</span>}
          </Link>
        );
      })}

      <div className="sidebar-foot">
        <span className="dot"></span>
        <span>متصل · hermes-server-37</span>
      </div>
    </nav>
  );
}
