/** @type {import('next').NextConfig} */
const nextConfig = {
  // server mode — API routes (company/control) بتحتاج runtime
  images: { unoptimized: true },
  // 🔥 منع صفحة تحذير ngrok الوسيطة — خلّي المتصفح يخش مباشرة
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'ngrok-skip-browser-warning', value: 'true' },
        ],
      },
    ];
  },
};
export default nextConfig;