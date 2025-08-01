/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Exclude HeartbeatWorker from Terser processing
    if (config.optimization && config.optimization.minimizer) {
      config.optimization.minimizer.forEach((minimizer) => {
        if (minimizer.constructor.name === 'TerserPlugin') {
          // Add exclude pattern for HeartbeatWorker
          if (!minimizer.options.exclude) {
            minimizer.options.exclude = [];
          }
          minimizer.options.exclude.push(/HeartbeatWorker\.js$/);
        }
      });
    }

    return config;
  },
}

export default nextConfig
