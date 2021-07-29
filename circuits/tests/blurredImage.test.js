function stringToBits(string) {
  const buff = Buffer.from(string);
  let bitString = '';
  buff.forEach(integer => {
    const bits = integer.toString(2).padStart(8, '0');
    bitString += bits;
  });
  return bitString;
}

function dec2bin(dec) {
  return dec.toString(2);
}

function blurImage(preImage, key) {
  const keyBits = dec2bin(key);
  const blurredImage = preImage.map((bit, index) => {
    return bit^keyBits[keyBits.length-1-index];
  });
  return blurredImage;
}

const fs = require('fs');
const { Keypair } = require('maci-domainobjs');

const preimage = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0];

const key1 = new Keypair();
const key2 = new Keypair();

const sharedKey = Keypair.genEcdhSharedKey(key1.privKey, key2.pubKey);

const input = {
  pre_image: preimage.map(_ => _.toString()),
  key: sharedKey.toString(),
  blurred_image: blurImage(preimage, sharedKey).map(_ => _.toString()),
};

fs.writeFile(
  './circuits/blur-image/input.json',
  JSON.stringify(input),
  () => {},
);
