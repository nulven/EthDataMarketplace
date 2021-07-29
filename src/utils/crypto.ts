import { encrypt, decrypt } from 'maci-crypto';
import { Keypair } from 'maci-domainobjs';

import { Ciphertext } from '../types';


function dec2bin(dec) {
  return dec.toString(2);
}

function blurImage(preImage, key): number[] {
  const _preImage = preImage.map(Number);
  const keyBits = dec2bin(key);
  const blurredImage = _preImage.map((bit, index) => {
    return bit^keyBits[keyBits.length-1-index];
  });
  return blurredImage;
}

function genSharedKey() {
  const key1 = new Keypair();
  const key2 = new Keypair();

  const sharedKey = Keypair.genEcdhSharedKey(key1.privKey, key2.pubKey);
  return sharedKey;
}

function encryptMessage(message: bigint, key: BigInt) {
  return encrypt([message], key);
}

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

function getPreimage(url: string) {
  return localStorage.getItem(url);
}

function setPreimage(url: string, preimage: string) {
  return localStorage.setItem(url, preimage);
}

function getCiphertext(url: string) {
  const storedCiphertext = localStorage.getItem(`${url}_ciphertext`);
  const [type, _ciphertextString] = storedCiphertext.split('_');
  let ciphertext;
  if (type === 'hash') {
    const _ciphertext = _ciphertextString.split(',').map(BigInt);
    ciphertext = {
      iv: _ciphertext[0],
      data: [_ciphertext[1]],
    };
  } else if (type === 'blur') {
    const _ciphertext = _ciphertextString.split(',');
    ciphertext = _ciphertext.map(parseInt);
  }
  return ciphertext;
}

function setCiphertext(url: string, ciphertext: any, type: string) {
  const _ciphertext = ciphertextAsCircuitInputs(ciphertext);
  return localStorage.setItem(
    `${url}_ciphertext`,
    `${type}_ciphertext.toString()`,
  );
}

function getKey(url: string): BigInt {
  const _key = localStorage.getItem(`${url}_key`);
  const key = BigInt(_key);
  return key;
}

function setKey(url: string, key: BigInt) {
  return localStorage.setItem(`${url}_key`, key.toString());
}

function toCircuitInputs(bitString) {
  const bitArray = bitString.split('').map(_ => BigInt(parseInt(_)));
  return bitArray.reverse();
}

function ciphertextAsCircuitInputs(ciphertext) {
  return [ciphertext.iv.toString(), ...ciphertext.data.map(_ => _.toString())];
}

function decryptDFCiphertext(
  ciphertext: Ciphertext,
  sharedKey: BigInt,
): BigInt[] {
  const message = decrypt(ciphertext, sharedKey);
  return message.map(BigInt);
}

function decryptKeyCiphertext(
  ciphertext: Ciphertext,
  sharedKey: BigInt,
): BigInt {
  const messageNum = decrypt(ciphertext, sharedKey)[0];
  return BigInt(messageNum);
}

function decryptMessageCiphertext(
  ciphertext: Ciphertext,
  sharedKey: BigInt,
): string {
  const messageNum = decrypt(ciphertext, sharedKey)[0];
  const messageBits = messageNum.toString(2);
  const length = messageBits.length + (8 - (messageBits.length % 8));
  const fullMessageBits = messageBits.padStart(length, '0');
  const messageBitsArray = fullMessageBits.split('');
  let message = '';
  for (let i = 0; i < messageBitsArray.length; i+=8) {
    const bits = messageBitsArray.slice(i, i+8).join('');
    const charCode = parseInt(bits, 2);
    const character = String.fromCharCode(charCode);
    message = message + character;
  }
  return message;
}

export {
  Keypair,
  decryptKeyCiphertext,
  decryptDFCiphertext,
  decryptMessageCiphertext,
  ciphertextAsCircuitInputs,
  getKey,
  setKey,
  blurImage,
  genSharedKey,
  encryptMessage,
  stringToNum,
  stringToBits,
  getPreimage,
  setPreimage,
  getCiphertext,
  setCiphertext,
};
