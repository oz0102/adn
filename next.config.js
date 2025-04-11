/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Add a rule to handle binary files like zstd.node
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
      type: 'javascript/auto',
    });

    // Prevent certain MongoDB dependencies from being bundled on the client side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        mongodb: false,
        '@mongodb-js/zstd': false,
        kerberos: false,
        'mongodb-client-encryption': false,
        'aws4': false,
        'snappy': false,
        'socks': false,
        'gcp-metadata': false,
      };
    }

    return config;
  },
}

module.exports = nextConfig
