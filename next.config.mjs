/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "silentfellow-sih-2024.s3.us-east-1.amazonaws.com",
      },
    ]
  }
};

export default nextConfig;
