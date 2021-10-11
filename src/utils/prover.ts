import { post } from './api';
import { Snark, Stark, ZKTypes } from '../types';
import config from '../../config';
const STARKWARE_APP = config.starkwareApp;

const wasmPath = '/circuits/wasm/';
const keyPath = '/circuits/keys/';
const verificationKeyPath = '/circuits/verification_keys/';

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

async function prove(circuit, inputs, zk: ZKTypes): Promise<Snark | Stark> {
  const prover = zk === 'snark' ? proveSnark : proveStark;
  return prover(circuit, inputs);
}

async function verifyStark(
  circuit: string,
  proof: Snark & Stark,
): Promise<boolean> {
  // send to sharp
  if ('programOutputs' in proof) {
    return new Promise(resolve => resolve(true));
  } else {
    throw new Error('proof is not a STARK');
  }
}

async function verifySnark(
  circuit: string,
  proof: Snark & Stark,
): Promise<boolean> {
  if ('publicSignals' in proof) {
    const vKey = await fetch(verificationKeyPath + camelCase(circuit) + '.json')
      .then(res => {
        return res.json();
      });

    // @ts-ignore
    const res = await snarkjs.groth16.verify(
      vKey,
      proof.publicSignals,
      proof.proof,
    );
    return res;
  } else {
    throw new Error('proof is not a SNARK');
  }
}

async function verify(
  circuit: string,
  proof: Snark & Stark,
  zk: ZKTypes,
): Promise<boolean> {
  const verifier = zk === 'snark' ? verifySnark : verifyStark;
  return verifier(circuit, proof);
}

// PROVERS
export async function proveEncryption(
  zk: ZKTypes,
  args,
) {
  return prove('encryption', {
    key: args[0].toString(),
    seller_private_key: args[1].asCircuitInputs(),
    buyer_public_key: args[2].asCircuitInputs(),
  }, zk);
}

export async function proveHash(zk: ZKTypes, args) {
  return prove('hash', {
    preimage: args[1].toString(),
    key: args[0].toString(),
    salt: args[2].toString(),
  }, zk);
}

export async function proveBlur(zk: ZKTypes, args) {
  return prove('blur-image', {
    preimage: args[1].map(_ => _.toString()),
    key: args[0].toString(),
    blurred_image: args[2].map(_ => _.toString()),
  }, zk);
}

export async function proveDarkForest(zk: ZKTypes, args) {
  return prove('dark-forest', {
    x: args[1].toString(),
    y: args[2].toString(),
    key: args[0].toString(),
    hash: args[3].toString(),
    salt: args[4],
  }, zk);
}

// VERIFIERS
export const verifyEncryption = async (zk: ZKTypes, proof) => verify('encryption', proof, zk);
export const verifyHash = async (zk: ZKTypes, proof) => verify('hash', proof, zk);
export const verifyBlur = async (zk: ZKTypes, proof) => verify('blur', proof, zk);
export const verifyDarkForest = async (zk: ZKTypes, proof) => verify('dark-forest', proof, zk);
