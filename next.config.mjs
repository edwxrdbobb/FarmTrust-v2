/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', 'supabase.co'],
    unoptimized: true,
  },
  experimental: {
    serverActions: {
     enabled: true
    }
  },
  // Suppress hydration warnings for browser extension attributes
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Add React strict mode to help catch issues
  reactStrictMode: true,
  // Configure API routes for file uploads
  //api: {
  //  bodyParser: {
  //    sizeLimit: '10mb',
  //  },
  //  responseLimit: '10mb',
  //},
}

export default nextConfig
