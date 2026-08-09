import type { Metadata, Viewport } from 'next';
import './globals.css';
import Shell from '@/components/Shell';
import { SWRegister } from '@/components/SWRegister';

const SITE_URL = 'https://cb3f13b684a67f.lhr.life';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'إسلام — موقعك الشامل | Islam Site v4',
    template: '%s | إسلام — Islam Site',
  },
  description:
    'إسلام — موقعك الشامل: الشركة، الدراسة، الميكاترونكس، التحكم، السيرفر. كل حياتك الرقمية في مكان واحد.',
  keywords: [
    'إسلام', 'مساعد ذكي', 'AI Agent', 'ذكاء اصطناعي', 'مساعد شخصي',
    'Islam Agent', 'محمود محمد نجيب', 'ميكاترونكس', 'أتمتة', 'تحكم عن بعد',
  ],
  authors: [{ name: 'Mahmoud Mohamed Nagib' }],
  creator: 'Mahmoud Mohamed Nagib',
  applicationName: 'Islam Site',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/icon-192.png', sizes: '192x192' }],
  },
  appleWebApp: {
    capable: true,
    title: 'إسلام',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_AR',
    url: SITE_URL,
    siteName: 'إسلام — Islam Site',
    title: 'إسلام — موقعك الشامل',
    description: 'الشركة، الدراسة، الميكاترونكس، التحكم، السيرفر — كل حاجة في مكان واحد.',
  },
  robots: { index: true, follow: true },
  category: 'technology',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0f1e',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Shell>{children}</Shell>
        <SWRegister />
      </body>
    </html>
  );
}
