const { writeFile } = require('fs');
const config = require('./default_config');

writeFile('./src/config/built_config.json', JSON.stringify(config), () => {});
