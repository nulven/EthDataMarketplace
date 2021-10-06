require('dotenv').config();
const env = process.env.NODE_ENV;

const defaultConfig = {
  enableDarkForestCheck: process.env.DARK_FOREST_CHECK === 'true',
  ipfsHost: process.env.IPFS_HOST,
  ipfsProtocol: process.env.IPFS_PROTOCOL,
  network: process.env.NETWORK,
  zk: process.env.ZK,
  starkwareApp: process.env.STARKWARE_APP,
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
