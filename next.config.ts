import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/admin/login",
        destination: "/login",
        permanent: true,
      },
    ];
  },
  images: {
    formats: ["image/webp"],
    minimumCacheTTL: 86400,
    qualities: [75, 76, 82],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "media.vmtshop.tech",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
