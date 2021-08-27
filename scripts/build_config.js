const { writeFile } = require('fs');
const config = require('../config/config');
let contractJSON;
if (process.env.NODE_ENV === 'production') {
  contractJSON = require('../public/contracts/prod/Core.json');
} else {
  contractJSON = require('../public/contracts/dev/Core.json');
}
cairoAddress = require('../cairo/contracts/main2_address.json');

writeFile('./config/config.json', JSON.stringify(config), () => {});
writeFile('./public/contracts/Core.json', JSON.stringify(contractJSON), () => {});
writeFile('./public/cairo.json', JSON.stringify(cairoAddress), () => {});
