/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/classes",
        destination: "https://attendify-wnl8.onrender.com/api/teacher/courses",
      },
      {
        source: "/api/:path*",
        destination: "https://attendify-wnl8.onrender.com/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
