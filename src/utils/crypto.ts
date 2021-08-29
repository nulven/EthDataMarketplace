import { encrypt, decrypt } from 'maci-crypto';
import { Keypair } from 'maci-domainobjs';
import { post } from './api';

import { Ciphertext } from '../types';

import bigInt from 'big-integer';
import { BigInteger } from 'big-integer';

function serializeUrl(url: string) {
  const part1 = url.slice(0, url.length / 2);
  const part2 = url.slice(url.length / 2);
  const parts = [part1, part2];
  return parts.map(part => BigInt(`0x${Buffer.from(part).toString('hex')}`).toString());
}

function parseUrl(parts: BigInt[]): string {
  const newParts = parts.map(part => Buffer.from(part.toString(16), 'hex').toString());
  return newParts.join('');
}

export const p = bigInt(
  '21888242871839275222246405745257275088548364400416034343698204186575808495' +
  '617',
);
const modPBigIntNative = (x: BigInteger) => {
  let ret = bigInt(x).mod(p);
  if (ret.lesser(bigInt(0))) {
    ret = ret.add(p);
  }
  return ret;
};

async function pedersenHash(x: BigInt, y: BigInt): Promise<BigInt> {
  return new Promise(resolve => {
    post('http://localhost:5002/hash', { x: x.toString(), y: y.toString() }).then(res => {
      console.log(res.res);
      resolve(BigInt(res.res));
    });
  });
}

function dec2bin(dec) {
  return dec.toString(2);
}

function blurImage(preImage: number[], key: BigInt): number[] {
  const keyBits = dec2bin(key);
  const blurredImage = preImage.map((bit, index) => {
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
    `${type}_${_ciphertext.toString()}`,
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

function decryptDarkForestCiphertext(
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

async function decryptKeyCiphertextPedersen(
  ciphertext: Ciphertext,
  sharedKey: BigInt,
): Promise<BigInt> {
  const messageNum = await decryptPedersen(ciphertext, sharedKey)[0];
  return BigInt(messageNum);
}

async function decryptPedersen(ciphertext: Ciphertext, sharedKey: BigInt) {
  const plaintext = ciphertext.data.map(
    async (e: BigInt, i: number): Promise<BigInt> => {
      return new Promise(resolve => {
        pedersenHash(sharedKey, BigInt(ciphertext.iv) + BigInt(i)).then(hash => {
          resolve(BigInt(e) - BigInt(hash));
        });
      });
    },
  );
  return Promise.all(plaintext);
}

function decryptMessageCiphertext1(
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

async function decryptMessageCiphertext(
  ciphertext: Ciphertext,
  sharedKey: BigInt,
): Promise<string> {
  const messageNum = await decryptPedersen(ciphertext, sharedKey)[0];
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
  decryptKeyCiphertextPedersen,
  decryptDarkForestCiphertext,
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
  modPBigIntNative,
  serializeUrl,
  parseUrl,
  pedersenHash,
};