/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: false,
  images: { unoptimized: true },
  experimental: { workerThreads: false, cpus: 2 },
  staticPageGenerationTimeout: 120,
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
