/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  transpilePackages: [
    'mongoose',
    'mongodb',
    '@mongodb-js/zstd',
    'snappy',
    'aws4',
    'kerberos',
    'mongodb-client-encryption',
    '@aws-sdk/credential-providers',
    'gcp-metadata',
    'socks'
  ],
  webpack: (config, { isServer }) => {
    // Only include MongoDB-related modules in server-side bundles
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Add aliases to prevent client-side imports
        mongoose: false,
        mongodb: false,
        '@mongodb-js/zstd': false,
        snappy: false,
        aws4: false,
        kerberos: false,
        'mongodb-client-encryption': false,
        '@aws-sdk/credential-providers': false,
        'gcp-metadata': false,
        socks: false
      };
    }
    return config;
  },
};

module.exports = nextConfig;
