const maci = require('maci-crypto');
const { mimc7 } = require('circomlib');
const fs = require('fs');
const { Keypair } = require('maci-domainobjs');


const key1 = new Keypair();
const key2 = new Keypair();

const sharedKey1 = Keypair.genEcdhSharedKey(key1.privKey, key2.pubKey);
console.log(sharedKey1);
const sharedKey2 = Keypair.genEcdhSharedKey(key2.privKey, key1.pubKey);


function stringToNum(string) {
  const bitString = stringToBits(string);
  const number = BigInt(parseInt(bitString, 2));
  return number;
}

function stringToBits(string) {
  const buff = Buffer.from(string);
  let bitString = '';
  buff.forEach(integer => {
    const bits = integer.toString(2).padStart(8, '0');
    bitString += bits;
  });
  return bitString;
}

function toCircuitInputs(bitString) {
  const bitArray = bitString.split('').map(_ => BigInt(parseInt(_)));
  return bitArray.reverse();
}
const hash = mimc7.multiHash([stringToNum('hello')], BigInt(0));

const encryptionInput = {
  pre_image: stringToNum('hello').toString(),
  hash: hash.toString(),
  private_key: key1.privKey.asCircuitInputs(),
  public_key: key2.pubKey.asCircuitInputs()
};

//const message = maci.encrypt(preimageArray, sharedKey1);

function messageAsCircuitInputs(message) {
  return [message.iv.toString(), ...message.data.map(_ => _.toString())];
}

/*
const decryptionInput = {
  message: messageAsCircuitInputs(message),
  private_key: key2.privKey.asCircuitInputs(),
  public_key: key1.pubKey.asCircuitInputs()
};
*/

console.log(encryptionInput);

fs.writeFile('./circuits/encryption/input.json', JSON.stringify(encryptionInput), () => {})
//fs.writeFile('./circuits/decryption/input.json', JSON.stringify(decryptionInput), () => {})
