/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/dashboard',
  experimental: {
    serverComponentsExternalPackages: [
      "@sismo-core/sismo-connect-server",
      "hammerjs",
    ],
  },
  // rewrites: async () => {
  //   return [
  //     {
  //       source: "/api/:path*",
  //       destination:
  //         process.env.NODE_ENV === "development"
  //           ? "http://127.0.0.1:8000/api/:path*"
  //           : "/api/",
  //     },
  //     {
  //       source: "/docs",
  //       destination:
  //         process.env.NODE_ENV === "development"
  //           ? "http://127.0.0.1:8000/docs"
  //           : "/api/docs",
  //     },
  //     {
  //       source: "/openapi.json",
  //       destination:
  //         process.env.NODE_ENV === "development"
  //           ? "http://127.0.0.1:8000/openapi.json"
  //           : "/api/openapi.json",
  //     },
  //   ];
  // },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals.push({ bufferutil: "bufferutil", "utf-8-validate": "utf-8-validate" });
    }

    return config;
  },
};

module.exports = nextConfig;
