import type { MetadataRoute } from 'next';

// ═══════════ PWA Manifest — موقع إسلام كتطبيق ═══════════

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'إسلام — موقعك الشامل',
    short_name: 'إسلام',
    description: 'كل حاجة في مكان واحد — الشركة، الدراسة، الميكاترونكس، التحكم، السيرفر',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0f1e',
    theme_color: '#0a0f1e',
    dir: 'rtl',
    lang: 'ar',
    orientation: 'any',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
