/** @type {import('next').NextConfig} */
const nextConfig = {
      images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**', // Allows any path under /api/
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**', // Allows any path on this host
      },
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
        port: '',
        pathname: '/**', // Allows any path on this host
      },

    ],
  },

};

export default nextConfig;
