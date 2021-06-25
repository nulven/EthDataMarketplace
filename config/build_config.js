const { writeFile } = require('fs');
const config = require('./config');

writeFile('./config/config.json', JSON.stringify(config), () => {});
