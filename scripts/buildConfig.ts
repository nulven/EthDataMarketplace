import fs from 'fs';
import path from 'path';
import config from '../config/config';
import { upperCase } from './utils';

const cwd = process.cwd();

let network;
if (config.env === 'production') {
  network = config.network;
} else {
  network = 'localhost';
}

const deployedContractsDir = path.resolve(`${cwd}/deployments/${network}`);
const contracts = fs.readdirSync(deployedContractsDir).map(_ => _.split('.')[0]);
contracts.forEach(contract => {
  const contractName = upperCase(contract);
  const abiJson = JSON.parse(fs.readFileSync(`./artifacts/contracts/${contractName}.sol/${contractName}.json`).toString());
  let addressJson;
  addressJson = JSON.parse(fs.readFileSync(`./deployments/${network}/${contractName}.json`).toString());

  if (!fs.existsSync('./public/contracts')) {
    fs.mkdirSync('./public/contracts', { recursive: true });
  }
  fs.writeFileSync('./config/config.json', JSON.stringify(config));
  fs.writeFileSync(`./public/contracts/${contractName}.json`, JSON.stringify({
    address: addressJson.address,
    abi: abiJson.abi,
  }));

  if (!fs.existsSync('./public/circuits/key')) {
    fs.mkdirSync('./public/circuits/key', { recursive: true });
  }
  if (!fs.existsSync('./public/circuits/verification_key')) {
    fs.mkdirSync('./public/circuits/verification_key', { recursive: true });
  }
  if (!fs.existsSync('./public/circuits/wasm')) {
    fs.mkdirSync('./public/circuits/wasm', { recursive: true });
  }
});

const compiledCircuitsDir = path.resolve(`${cwd}/compiledCircuits`);
const circuits = fs.readdirSync(compiledCircuitsDir);
circuits.forEach(circuit => {
  fs.copyFileSync(
    `${compiledCircuitsDir}/${circuit}/circuit.wasm`,
    `${cwd}/public/circuits/wasm/${upperCase(circuit)}.wasm`,
  );
  fs.copyFileSync(
    `${compiledCircuitsDir}/${circuit}/verification_key.json`,
    `${cwd}/public/circuits/verification_key/${upperCase(circuit)}.json`,
  );
  fs.copyFileSync(
    `${compiledCircuitsDir}/${circuit}/circuit.zkey`,
    `${cwd}/public/circuits/key/${upperCase(circuit)}.zkey`,
  );
});
