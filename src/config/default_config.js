require('dotenv').config();

let env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

const config = {
  'test': {
    'env': 'test',
    apiUrl: 'http://localhost:8082',
    'host': 'localhost',
    'port': 8082,
    apiToken: process.env.API_TOKEN,
    seed: process.env.SKYID_SEED,
    domain: 'nikolai',
    nbAccessKey: process.env.ACCESS_KEY,
    nbSecretKey: process.env.SECRET_KEY,
  },
  'development': {
    'env': 'development',
    apiUrl: 'http://localhost:8080',
    'host': 'localhost',
    'port': 8080,
    apiToken: process.env.API_TOKEN,
    seed: process.env.SKYID_SEED,
    domain: 'nikolai',
    nbAccessKey: process.env.ACCESS_KEY,
    nbSecretKey: process.env.SECRET_KEY,
  },
  'production': {
    'env': 'production',
    apiUrl: 'https://confessions.digital',
    'host': '0.0.0.0',
    'port': 443,
    apiToken: process.env.API_TOKEN,
    seed: process.env.SKYID_SEED,
  },
};

const export_config = config[env];
module.exports = export_config;
