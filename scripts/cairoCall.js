const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const contractName = process.argv[2];
const func = process.argv[3];
const type = process.argv[4];
const inputs = process.argv.slice(5);

const cwd = process.cwd();
const directory = path.resolve(`${cwd}/cairo/contracts`);
const contractAbi = JSON.parse(fs.readFileSync(`${directory}/${contractName}_abi.json`));
const CONTRACT_ADDRESS = JSON.parse(fs.readFileSync(`${directory}/${contractName}_address.json`)).address;

if (type === 'invoke') {
  if (inputs.length > 0) {
    execSync(`starknet invoke \ --address ${CONTRACT_ADDRESS} \ --abi ./cairo/contracts/${contractName}_abi.json \ --function ${func} \ --inputs ${inputs.join(' ')}`, {
      stdio: 'inherit',
    });
  } else {
    execSync(`starknet invoke \ --address ${CONTRACT_ADDRESS} \ --abi ./cairo/contracts/${contractName}_abi.json \ --function ${func}`, {
      stdio: 'inherit',
    });
  }
} else {
  if (inputs.length > 0) {
    execSync(`starknet call \ --address ${CONTRACT_ADDRESS} \ --abi ./cairo/contracts/${contractName}_abi.json \ --function ${func} \ --inputs ${inputs.join(' ')}`, {
      stdio: 'inherit',
    });
  } else {
    execSync(`starknet call \ --address ${CONTRACT_ADDRESS} \ --abi ./cairo/contracts/${contractName}_abi.json \ --function ${func}`, {
      stdio: 'inherit',
    });
  }
}
