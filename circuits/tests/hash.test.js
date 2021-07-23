function stringToBits(string) {
  const buff = Buffer.from(string);
  let bitString = '';
  buff.forEach(integer => {
    const bits = integer.toString(2).padStart(8, '0');
    bitString += bits;
  });
  return bitString;
}

function stringToNum(string) {
  const bitString = stringToBits(string);
  const number = BigInt(parseInt(bitString, 2));
  return number;
}

function ciphertextAsCircuitInputs(ciphertext) {
  return [ciphertext.iv.toString(), ...ciphertext.data.map(_ => _.toString())];
}

const maci = require('maci-crypto');
const { mimc7 } = require('circomlib');
const fs = require('fs');
const { Keypair } = require('maci-domainobjs');

const preimage = 'hello';
const preimageNum = stringToNum(preimage);

const key1 = new Keypair();
const key2 = new Keypair();

const sharedKey = Keypair.genEcdhSharedKey(key1.privKey, key2.pubKey);
const hash = mimc7.multiHash([preimageNum], BigInt(0));
const ciphertext = maci.encrypt([preimageNum], sharedKey);

const input = {
  pre_image: preimageNum.toString(),
  key: sharedKey.toString(),
  hash: hash.toString(),
};

fs.writeFile('./circuits/hash/input.json', JSON.stringify(input), () => {});
