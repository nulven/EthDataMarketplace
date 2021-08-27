const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const contractName = process.argv[2];

const cwd = process.cwd();
const directory = path.resolve(`${cwd}/cairo/contracts`);

execSync(`starknet-compile ./cairo/contracts/${contractName}.cairo \ --output ./cairo/contracts/${contractName}.json \ --abi ./cairo/contracts/${contractName}_abi.json`, {
  stdio: 'inherit',
});
exec(`starknet deploy --contract ./cairo/contracts/${contractName}.json`, (error, stdout, stderr) => {
  if (error) {
    console.log(error);
  }
  const address = stdout.match('(?<=Contract address: ).*')[0];
  fs.writeFileSync(`${directory}/${contractName}_address.json`, JSON.stringify({ address }));
});
