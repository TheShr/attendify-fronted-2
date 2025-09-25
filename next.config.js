/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don’t use output: 'export' since you need API rewrites
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://attendify-wnl8.onrender.com/api/:path*", // Proxy to Flask backend on Render
      },
    ];
  },
};

module.exports = nextConfig;
