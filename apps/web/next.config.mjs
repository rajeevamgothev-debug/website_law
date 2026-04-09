const internalApiOrigin = (process.env.INTERNAL_API_URL?.trim() || "http://127.0.0.1:4000").replace(/\/+$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@lexevo/contracts"],
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${internalApiOrigin}/:path*`
      }
    ];
  }
};

export default nextConfig;
