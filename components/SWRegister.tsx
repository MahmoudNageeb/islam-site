'use client';

// ═══════════ SWRegister — تسجيل Service Worker + إشعارات ═══════════

import { useEffect } from 'react';

export function SWRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const register = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch {}
    };
    register();
  }, []);

  return null;
}
