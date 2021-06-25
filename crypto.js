const maci = require('maci-crypto');
const { mimc7 } = require('circomlib');
const fs = require('fs');
const { Keypair } = require('maci-domainobjs');


const key1 = new Keypair();
const key2 = new Keypair();

const sharedKey1 = Keypair.genEcdhSharedKey(key1.privKey, key2.pubKey);
const sharedKey2 = Keypair.genEcdhSharedKey(key2.privKey, key1.pubKey);
console.log(sharedKey1);

const x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1]; 
const xBigInt = x.map(_ => BigInt(_));
const hash = mimc7.multiHash(xBigInt, BigInt(0));

const encryptionInput = {
  pre_image: x,
  hash: hash.toString(),
  private_key: key1.privKey.asCircuitInputs(),
  public_key: key2.pubKey.asCircuitInputs()
};

const message = maci.encrypt(xBigInt, sharedKey1);

function messageAsCircuitInputs(message) {
  return [message.iv.toString(), ...message.data.map(_ => _.toString())];
}

const decryptionInput = {
  message: messageAsCircuitInputs(message),
  private_key: key2.privKey.asCircuitInputs(),
  public_key: key1.pubKey.asCircuitInputs()
};

console.log(decryptionInput);

fs.writeFile('./circuits/encryption/input.json', JSON.stringify(encryptionInput), () => {})
fs.writeFile('./circuits/decryption/input.json', JSON.stringify(decryptionInput), () => {})
