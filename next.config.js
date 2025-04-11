// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle binary modules for MongoDB
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    // Exclude problematic MongoDB dependencies on the client side
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Exclude binary modules that cause issues on the client
        '@mongodb-js/zstd': false,
        'kerberos': false,
        'mongodb-client-encryption': false,
        'snappy': false,
        'aws4': false,
        'gcp-metadata': false,
        'socks': false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
