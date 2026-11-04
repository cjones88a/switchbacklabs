import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/services",
        destination: "/how-i-work",
        permanent: true,
      },
      {
        source: "/projects/ai-sites",
        destination: "/pm-of-the-future",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
