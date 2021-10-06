import { post } from './api';
import { Snark, Stark } from '../types';
import config from '../../config';
const STARKWARE_APP = config.starkwareApp;

const wasmPath = '/circuits/wasm/';
const keyPath = '/circuits/keys/';
const verificationKeyPath = '/circuits/verification_keys';
const ZK = config.zk;

function camelCase(str) {
  return str.split('-').map(_ => {
    return _[0].toUpperCase() + _.slice(1);
  }).join('');
}

// HELPERS
async function proveSnark(circuit, inputs): Promise<Snark> {
  // @ts-ignore
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    inputs,
    wasmPath + camelCase(circuit) + '.wasm',
    keyPath + camelCase(circuit) + '.zkey',
  );

  return { proof, publicSignals };
}

async function proveStark(circuit, inputs): Promise<Stark> {
  return new Promise((resolve, reject) => {
    post(`${STARKWARE_APP}/prove`, { circuit, inputs }).then(res => {
      const proof = {
        fact: res.res.fact,
        programOutputs: res.res.programOutputs.map(BigInt),
      };
      resolve(proof);
    }).catch(err => {
      reject(err);
    });
  });
}

async function prove(circuit, inputs): Promise<Snark | Stark> {
  const prover = ZK === 'snark' ? proveSnark : proveStark;
  return prover(circuit, inputs);
}

async function verifyStark(
  circuit: string,
  proof: Stark,
): Promise<boolean> {
  // send to sharp
  return new Promise(resolve => resolve(true));
}

async function verifySnark(circuit: string, proof: Snark): Promise<boolean> {
  const vKey = await fetch(verificationKeyPath + camelCase(circuit) + '.json')
    .then(res => {
      return res.json();
    });

  // @ts-ignore
  const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
  return res;
}

async function verify(circuit: string, proof: Snark | Stark): Promise<boolean> {
  const verifier = ZK === 'snark' ? verifySnark : verifyStark;
  return verifier(circuit, proof);
}

// PROVERS
// temporarily add sharedKey
export async function proveEncryption(
  preimage,
  privateKey,
  publicKey,
) {
  return prove('encryption', {
    key: preimage.toString(),
    seller_private_key: privateKey.rawPrivKey.toString(),
    buyer_public_key: publicKey.asCircuitInputs(),
  });
}

export async function proveHash(args) {
  return prove('hash', {
    preimage: args[1].toString(),
    key: args[0].toString(),
    salt: args[2].toString(),
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

// VERIFIERS
export const verifyEncryption = async (proof) => verify('encryption', proof);
export const verifyHash = async (proof) => verify('hash', proof);
export const verifyBlur = async (proof) => verify('blur', proof);
export const verifyDarkForest = async (proof) => verify('dark-forest', proof);
