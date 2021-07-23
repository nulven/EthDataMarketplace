import { ciphertextAsCircuitInputs } from './crypto';

const circuitPath = "/circuits/circuits-compiled/";
const keyPath = "/circuits/keys/";


// HELPERS
async function prove(circuit, inputs) {
  // prove that the signature is produced by the private key of the given public key
  // @ts-ignore
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    inputs,
    circuitPath + circuit + "/circuit.wasm",
    keyPath + circuit + "/circuit_final.zkey"
  );

  return { proof, publicSignals };
}

async function verify(circuit, proof, publicSignals) {
  const vKey = await fetch(keyPath + circuit + "/verification_key.json").then(
    function (res) {
      return res.json();
    }
  );

  // @ts-ignore
  const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
  return res;
}

// PROVERS
export async function proveEncryption(preImage, privateKey, hash, publicKey) {
  return prove('encryption', { pre_image: preImage, private_key: privateKey, hash, public_key: publicKey });
}

export async function proveHash(preImage, key, hash) {
  return prove('hash', {
    pre_image: preImage.toString(),
    key: key.toString(),
    hash: hash.toString(),
  });
}

export async function proveBlur(preimage, key, blurredImage) {
  return prove('blur-image', {
    pre_image: preimage.map(_ => _.toString()),
    key: key.toString(),
    blurred_image: blurredImage.map(_ => _.toString()),
  });
}

import { Keypair, PrivKey, PubKey } from 'maci-domainobjs';

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
  return verify('hash', proof.proof, proof.publicSignals)
}

export async function verifyBlur(proof) {
  return verify('blur-image', proof.proof, proof.publicSignals)
}

// FULL VERIFIERS
export async function fullVerifyEncryption(key, hash) {
  const { proof, publicSignals } = await prove('encryption', {
    x: key,
    hash: hash,
  });

  return verify('encryption', proof, publicSignals);
}
