const circuitPath = '/circuits/circuits-compiled/';
const keyPath = '/circuits/keys/';


// HELPERS
async function prove(circuit, inputs) {
  // @ts-ignore
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    inputs,
    circuitPath + circuit + '/circuit.wasm',
    keyPath + circuit + '/circuit_final.zkey',
  );

  return { proof, publicSignals };
}

async function verify(circuit, proof, publicSignals) {
  const vKey = await fetch(keyPath + circuit + '/verification_key.json')
    .then(res => {
      return res.json();
    });

  // @ts-ignore
  const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
  return res;
}

// PROVERS
export async function proveEncryption(preImage, privateKey, hash, publicKey) {
  return prove('encryption', {
    pre_image: preImage,
    private_key: privateKey,
    hash,
    public_key: publicKey,
  });
}

export async function proveHash(args) {
  return prove('hash', {
    pre_image: args[1].toString(),
    key: args[0].toString(),
    hash: args[2].toString(),
    salt: args[3],
  });
}

export async function proveBlur(args) {
  return prove('blur-image', {
    pre_image: args[1].map(_ => _.toString()),
    key: args[0].toString(),
    blurred_image: args[2].map(_ => _.toString()),
  });
}

export async function proveDF(args) {
  return prove('df', {
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

export async function verifyDF(proof) {
  return verify('df', proof.proof, proof.publicSignals);
}

// FULL VERIFIERS
export async function fullVerifyEncryption(key, hash) {
  const { proof, publicSignals } = await prove('encryption', {
    x: key,
    hash: hash,
  });

  return verify('encryption', proof, publicSignals);
}
