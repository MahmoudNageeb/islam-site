'use client';

// ═══════════ theme.ts — إدارة الثيم (يدوي: dark/light) ═══════════

export type Theme = 'dark' | 'light';

export const THEME_KEY = 'islam_theme';

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {}
  // Auto: حسب نظام الجهاز
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

export function initTheme() {
  applyTheme(getTheme());
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

// ═══════════ الحالة الحية (بيانات عامة للـ TopBar) ═══════════
export interface LiveSys {
  cpu?: number;
  ram?: number;
  disk?: number;
  services?: { name: string; status: string }[];
  checked_at?: string;
}

export async function fetchLiveSys(): Promise<LiveSys> {
  try {
    // `/api/system` فيه cpu/memory/disk الفعلية من الداشبورد
    const r = await fetch('/api/system');
    const d = await r.json();
    const data = d.data || d;
    return {
      cpu: data.cpu?.percent ?? data.cpu,
      ram: data.memory?.percent ?? data.ram,
      disk: data.disk?.percent ?? data.disk,
      services: data.services || [],
      checked_at: data.checked_at || '',
    };
  } catch {
    return {};
  }
}
