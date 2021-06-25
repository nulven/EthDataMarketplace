const circuitPath = "/circuits/circuits-compiled/";
const keyPath = "/circuits/keys/";

// HELPERS
async function prove(circuit, inputs) {
  // prove that the signature is produced by the private key of the given public key
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

  const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
  return res;
}

// PROVERS
export async function proveEncryption(preImage, privateKey, hash, publicKey) {
  return prove('encryption', { pre_image: preImage, private_key: privateKey, hash, public_key: publicKey });
}


// VERIFIERS
export async function verifyEncryption(proof) {
  return verify('encryption', proof.proof, proof.publicSignals);
}

// FULL VERIFIERS
export async function fullVerifyEncryption(key, hash) {
  const { proof, publicSignals } = await prove('encryption', {
    x: key,
    hash: hash,
  });

  return verify('encryption', proof, publicSignals);
}
