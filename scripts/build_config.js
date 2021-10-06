const { writeFile } = require('fs');
const config = require('../config/config');
let contractJSON;
let gettersContractJSON;
if (process.env.NODE_ENV === 'production') {
  contractJSON = require('../public/contracts/prod/Core.json');
  gettersContractJSON = require('../public/contracts/prod/Getters.json');
} else {
  contractJSON = require('../public/contracts/dev/Core.json');
  gettersContractJSON = require('../public/contracts/dev/Getters.json');
}
//cairoAddress = require('../cairo/contracts/Core_address.json');

writeFile('./config/config.json', JSON.stringify(config), () => {});
writeFile('./public/contracts/Core.json', JSON.stringify(contractJSON), () => {});
writeFile('./public/contracts/Getters.json', JSON.stringify(gettersContractJSON), () => {});
//writeFile('./public/cairo.json', JSON.stringify(cairoAddress), () => {});
