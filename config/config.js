require('dotenv').config();
const env = process.env.NODE_ENV;

const defaultConfig = {
  enableDarkForestCheck: process.env.DARK_FOREST_CHECK === 'true',
  ipfsHost: process.env.IPFS_HOST,
  ipfsProtocol: process.env.IPFS_PROTOCOL,
};

const config = {
  development: {
    env: 'development',
    ...defaultConfig,
  },
  production: {
    env: 'production',
    ...defaultConfig,
  },
};
const export_config = config[env];

module.exports = export_config;
