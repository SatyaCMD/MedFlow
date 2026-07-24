/** @type {import('next').NextConfig} */
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com https://*.googleapis.com https://*.google.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.google.com https://*.googleapis.com https://*.gstatic.com https://*.tile.openstreetmap.org https://*.cartocdn.com https://server.arcgisonline.com;
    font-src 'self' https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-src 'self' https://*.google.com https://www.google.com;
    connect-src 'self' http://localhost:4000 ws://localhost:4000 https://*.googleapis.com https://nominatim.openstreetmap.org;
`;

const nextConfig = {
  reactStrictMode: true,
  // output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\s{2,}/g, ' ').trim(),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer-when-downgrade',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
