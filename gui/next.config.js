/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/dashboard',
  experimental: {
    serverComponentsExternalPackages: [
      "@sismo-core/sismo-connect-server",
      "hammerjs",
    ],
  },
  rewrites: async () => {
    return [
      {
        source: "/api/engine/:path*",
        destination: "https://chainflow-engine.dexguru.biz/engine-rest/:path*",
      }
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals.push({ bufferutil: "bufferutil", "utf-8-validate": "utf-8-validate" });
    }

    return config;
  },
};

module.exports = nextConfig;
