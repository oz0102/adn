/** @type {import("next").NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle binary modules for MongoDB
    config.module.rules.push({
      test: /\.node$/,
      use: "node-loader",
    });

    // Exclude problematic MongoDB dependencies and Node.js core modules on the client side
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Exclude binary modules that cause issues on the client
        "@mongodb-js/zstd": false,
        "kerberos": false,
        "mongodb-client-encryption": false, // This might be too broad if some parts are needed, but often the cause
        "snappy": false,
        "aws4": false,
        "gcp-metadata": false,
        "socks": false,
        // Add aliases for Node.js core modules causing errors
        "net": false,
        "child_process": false,
        "fs/promises": false,
        "fs": false, // Adding fs as well, as fs/promises might imply fs
        "tls": false,
        "dns": false, // Added dns
        "timers/promises": false, // Added timers/promises
      };
    }

    return config;
  },
};

module.exports = nextConfig;

