/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports if needed
  // output: 'export',
  
  // Ignore TypeScript errors during build (optional, remove if you want strict checks)
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Ignore ESLint errors during build (optional)
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig

