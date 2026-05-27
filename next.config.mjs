/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',          // static HTML export → deploy to Firebase Hosting
  trailingSlash: false,
  images: {
    unoptimized: true,       // required for static export; images served via ImageKit CDN
  },
};

export default nextConfig;
