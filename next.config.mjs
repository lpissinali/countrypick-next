/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',          // static HTML export → deploy to Firebase Hosting
  trailingSlash: false,
  images: {
    unoptimized: true,       // required for static export; images served via ImageKit CDN
  },
  // Limit parallelism during static generation to avoid overwhelming MySQL
  experimental: {
    workerThreads: false,
    cpus: 2,
  },
  staticPageGenerationTimeout: 120,
};

export default nextConfig;
