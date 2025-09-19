/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    }
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.polygon.io" },
      { protocol: "https", hostname: "storage.googleapis.com" }
    ]
  }
}

export default nextConfig
