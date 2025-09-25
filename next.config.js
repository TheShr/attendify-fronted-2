/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://attendify-wnl8.onrender.com/api/:path*", // Flask backend
      },
    ];
  },
};

module.exports = nextConfig;
