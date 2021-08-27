const wasmPath = '/circuits/wasm/';
const keyPath = '/circuits/keys/';
const verificationKeyPath = '/circuits/verification_keys';
import { post } from './api';

function camelCase(str) {
  return str.split('-').map(_ => {
    return _[0].toUpperCase() + _.slice(1);
  }).join('');
}

// HELPERS
async function prove1(circuit, inputs) {
  // @ts-ignore
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    inputs,
    wasmPath + camelCase(circuit) + '.wasm',
    keyPath + camelCase(circuit) + '.zkey',
  );

  return { proof, publicSignals };
}

async function prove(circuit, inputs) {
  console.log('here', inputs);
  /*
  return new Promise(resolve => {
    post('http://localhost:5002/prove', { circuit, inputs }).then(res => {
      resolve(res.res);
    });
  });
  */
  return new Promise(resolve => {
    resolve({
      fact: '0xf457e4311f8229ab7b08191a6658112a29a962a9f2fe95d7a3d4f1200eef0195',
      jobKey: '1f38cbf0-7153-4114-9442-44501bfed8eb',
    });
  });
}

async function verify(circuit, proof, publicSignals) {
  const vKey = await fetch(verificationKeyPath + camelCase(circuit) + '.json')
    .then(res => {
      return res.json();
    });

  // @ts-ignore
  const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
  return res;
}

// PROVERS
export async function proveEncryption(preimage, privateKey, hash, publicKey) {
  return prove('encryption', {
    preimage,
    private_key: privateKey,
    hash,
    public_key: publicKey,
  });
}

export async function proveHash(args) {
  return prove('hash', {
    preimage: args[1].toString(),
    key: args[0].toString(),
    hash: args[2].toString(),
    salt: args[3].toString(),
  });
}

export async function proveBlur(args) {
  return prove('blur-image', {
    preimage: args[1].map(_ => _.toString()),
    key: args[0].toString(),
    blurred_image: args[2].map(_ => _.toString()),
  });
}

export async function proveDarkForest(args) {
  return prove('dark-forest', {
    x: args[1].toString(),
    y: args[2].toString(),
    key: args[0].toString(),
    hash: args[3].toString(),
    salt: args[4],
  });
}

import { PrivKey, PubKey } from 'maci-domainobjs';

export async function proveContract(
  privateKey: PrivKey,
  key,
  publicKey: PubKey,
) {
  return prove('contract', {
    private_key: privateKey.asCircuitInputs(),
    key: key.toString(),
    public_key: publicKey.asCircuitInputs(),
  });
}


// VERIFIERS
export async function verifyEncryption(proof) {
  return verify('encryption', proof.proof, proof.publicSignals);
}

export async function verifyHash(proof) {
  return verify('hash', proof.proof, proof.publicSignals);
}

export async function verifyBlur(proof) {
  return verify('blur-image', proof.proof, proof.publicSignals);
}

export async function verifyDarkForest(proof) {
  return verify('dark-forest', proof.proof, proof.publicSignals);
}

// FULL VERIFIERS
export async function fullVerifyEncryption(key, hash) {
  const { proof, publicSignals } = await prove('encryption', {
    x: key,
    hash: hash,
  });

  return verify('encryption', proof, publicSignals);
}
