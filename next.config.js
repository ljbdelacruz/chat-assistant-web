/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: [],
  },
  env: {
    TRANSCRIPTION_SERVICE_URL: process.env.TRANSCRIPTION_SERVICE_URL || 'http://localhost:8001',
  },
}

module.exports = nextConfig
