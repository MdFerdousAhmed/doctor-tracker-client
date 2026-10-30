/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopackPluginRuntimeStrategy: "forceWorkerThreads",
  },
};

export default nextConfig;
