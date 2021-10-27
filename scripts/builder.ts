require('dotenv').config();

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { upperCase } from './utils';

const wasmOutPath = 'wasm';
const zkeyOutPath = 'keys';
const verificationOutPath = 'verification_keys';
const deterministic = process.argv[2] === 'true';
const circuitsList = process.argv[3];
let potFile = process.argv[4];

// TODO: add an option to generate with entropy for production keys

if (process.argv.length !== 5) {
  console.log('usage');
  console.log(
    'builder comma,seperated,list,of,circuits wasm_out_path zkey_out_path [`true` if deterministic / `false` if not] pot_size \n for example, $ node circuits/builder.js . . false sig-check 20'
  );
  process.exit(1);
}

if (!potFile) {
  potFile = '15';
}

const cwd = process.cwd();
const circuitsDirectory = path.resolve(`${cwd}/circuits`);
const outputDirectory = path.resolve(`${cwd}/compiledCircuits`);

if (!fs.existsSync(`${outputDirectory}`)) {
  fs.mkdirSync(`${outputDirectory}`);
}

for (let circuitName of circuitsList.split(',')) {
  if (deterministic && !process.env['beacon']) {
    console.log("ERROR! Can't find a sourced .env with a beacon variable");
    process.exit(1);
  }

  if (!fs.existsSync(`${outputDirectory}/${circuitName}`)) {
    fs.mkdirSync(`${outputDirectory}/${circuitName}`);
  }
  process.chdir(`${circuitsDirectory}/${circuitName}`);

  try {
    execSync('npx circom circuit.circom --r1cs --wasm --sym', {
      stdio: 'inherit',
    });
    execSync('npx snarkjs r1cs info circuit.r1cs', { stdio: 'inherit' });
    execSync(
      "npx snarkjs zkey new circuit.r1cs '" +
        circuitsDirectory +
        '/pots/pot' +
        potFile +
        "_final.ptau' circuit_" +
        circuitName +
        '.zkey',
      { stdio: 'inherit' }
    );
    if (deterministic) {
      execSync(
        'npx snarkjs zkey beacon circuit_' +
          circuitName +
          '.zkey circuit.zkey ' +
          process.env['beacon'] +
          ' 10',
        { stdio: 'inherit' }
      );
    } else {
      execSync(
        'npx snarkjs zkey contribute circuit_' +
          circuitName +
          '.zkey circuit.zkey ' +
          `-e='${Date.now()}'`,
        { stdio: 'inherit' }
      );
    }
    execSync(
      'npx snarkjs zkey export verificationkey circuit.zkey verification_key.json',
      { stdio: 'inherit' }
    );
    execSync(
      'npx snarkjs wtns calculate circuit.wasm input.json witness.wtns',
      {
        stdio: 'inherit',
      }
    );
    execSync(
      'npx snarkjs groth16 prove circuit.zkey witness.wtns proof.json public.json',
      { stdio: 'inherit' }
    );
    execSync(
      'npx snarkjs groth16 verify verification_key.json public.json proof.json',
      { stdio: 'inherit' }
    );
    fs.copyFileSync(
      'circuit.wasm',
      `${outputDirectory}/${circuitName}/circuit.wasm`
    );
    fs.copyFileSync(
      'circuit.zkey',
      `${outputDirectory}/${circuitName}/circuit.zkey`
    );
    fs.copyFileSync(
      'verification_key.json',
      `${outputDirectory}/${circuitName}/verification_key.json`
    );
    execSync('rm circuit.wasm', { stdio: 'inherit' });
    execSync('rm circuit.zkey', { stdio: 'inherit' });
    execSync(`rm circuit_${circuitName}.zkey`, { stdio: 'inherit' });
    execSync('rm verification_key.json', { stdio: 'inherit' });
    execSync('rm witness.wtns', { stdio: 'inherit' });
    execSync('rm circuit.r1cs', { stdio: 'inherit' });
    execSync('rm circuit.sym', { stdio: 'inherit' });
    execSync('rm proof.json', { stdio: 'inherit' });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}
