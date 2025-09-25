/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      // Special case: redirect /api/classes → backend’s /api/teacher/courses
      {
        source: "/api/classes",
        destination: "https://attendify-wnl8.onrender.com/api/teacher/courses",
      },
      // General case: proxy all other API calls
      {
        source: "/api/:path*",
        destination: "https://attendify-wnl8.onrender.com/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
