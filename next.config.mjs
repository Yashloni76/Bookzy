/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/ssr', '@supabase/supabase-js', 'nodemailer'],
    middlewarePrefetch: 'strict',
  },
};

export default nextConfig;
