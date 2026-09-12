/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { typedRoutes: false },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "img-src 'self' data: https: blob:",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "connect-src 'self' ws: wss: http: https:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

