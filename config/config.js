require('dotenv').config();

const env = process.env.NODE_ENV;

const config = {
  'development': {
    'apiUrl': 'http://localhost:8080',
    'env': 'development',
  },
  'production': {
    'apiUrl': process.env.API_URL,
    'env': 'production',
  },
};
const export_config = config[env];

module.exports = export_config;
