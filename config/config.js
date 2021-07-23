require('dotenv').config();
const env = process.env.NODE_ENV;

const config = {
  development: {
    env: 'development',
    mnemonic: process.env.MNEMONIC,
    walletPath: process.env.WALLET_PATH,
    projectId: process.env.PROJECT_ID,
  },
  production: {
    env: 'production',
    mnemonic: process.env.MNEMONIC,
    walletPath: process.env.WALLET_PATH,
    projectId: process.env.PROJECT_ID,
  },
};
const export_config = config[env];

module.exports = export_config;
