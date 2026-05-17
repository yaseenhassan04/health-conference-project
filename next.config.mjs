/** @type {import('next').NextConfig} */
const nextConfig = {
  // رفع حد حجم الملفات للـ API routes (مهم لرفع الملفات)
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },

  // إعدادات الصور إذا احتجتها
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
