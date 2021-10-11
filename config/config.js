require('dotenv').config();
const env = process.env.NODE_ENV;

const defaultConfig = {
  enableDarkForestCheck: process.env.DARK_FOREST_CHECK === 'true',
  ipfsHost: process.env.IPFS_HOST,
  network: process.env.NETWORK,
  chain: process.env.ETH_NETWORK,
  zk: process.env.ZK,
  starkwareApp: process.env.STARKWARE_APP,
  infuraId: process.env.INFURA_ID,
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
