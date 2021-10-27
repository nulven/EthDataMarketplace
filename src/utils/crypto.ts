import {
  encrypt as encryptMimc,
  decrypt as decryptMimc,
  genPrivKey as genPrivKeySnark,
  genPubKey as genPubKeySnark,
} from 'maci-crypto';
import { Keypair, PrivKey, PubKey } from 'maci-domainobjs';
import { mimc7 } from 'circomlib';
import bigInt from 'big-integer';
import { BigInteger } from 'big-integer';

import { pedersen, computeSharedKey, genSharedKey, genKeypair } from './signature';
import { get, post } from './api';
import { Snark, Stark, Ciphertext, ZKTypes } from '../types';
import {
  proveEncryption,
  proveHash,
  proveBlur,
  proveDarkForest,
  verifyEncryption,
  verifyHash,
  verifyBlur,
  verifyDarkForest,
} from './prover';

import config from '../../config';

function serializeUrl(url: string) {
  const part1 = url.slice(0, url.length / 2);
  const part2 = url.slice(url.length / 2);
  const parts = [part1, part2];
  return parts.map(part =>
    BigInt(`0x${Buffer.from(part).toString('hex')}`).toString());
}

function parseUrl(parts: BigInt[]): string {
  const newParts = parts.map(part =>
    Buffer.from(part.toString(16), 'hex').toString());
  return newParts.join('');
}


export const p = bigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');

const FIELD_PRIME = BigInt('3618502788666131213697322783095070105623107215331596699973092056135872020481');
const modPBigIntNative = (x: BigInteger) => {
  let ret = bigInt(x).mod(p);
  if (ret.lesser(bigInt(0))) {
    ret = ret.add(p);
  }
  return ret;
};

async function pedersenHash(x: BigInt, y: BigInt): Promise<BigInt> {
  return new Promise(resolve => {
    resolve(BigInt(`0x${pedersen([x, y])}`));
  });
}

async function mimcHash(x: BigInt, y: BigInt): Promise<BigInt> {
  return new Promise(resolve => {
    resolve(mimc7.multiHash([x], y));
  });
}

interface ZKFunctionsSkeleton {
  provers: Record<string, (any) =>
    Promise<Snark | Stark>>;
  verifiers: Record<string, (proof: any) => Promise<boolean>>;
  hash: (x: BigInt, y: BigInt) => Promise<BigInt>;
  sharedKey: (privKey: PrivKey, pubKey: PubKey) => Promise<BigInt>;
  genSharedKey: () => Promise<BigInt>;
  genKeys: () => Promise<{ privKey: BigInt; pubKey: BigInt[] }>;
  decrypt: (ciphertext: Ciphertext, sharedKey: BigInt) => Promise<BigInt[]>;
  decryptKeyCiphertext:
    (ciphertext: Ciphertext, sharedKey: BigInt) => Promise<BigInt>;
  decryptDarkForestCiphertext:
    (ciphertext: Ciphertext, sharedKey: BigInt) => Promise<BigInt[]>;
  decryptMessageCiphertext:
    (ciphertext: Ciphertext, sharedKey: BigInt) => Promise<string>;
}

const ZKFunctions: Record<ZKTypes, ZKFunctionsSkeleton> = {
  [ZKTypes.SNARK]: {
    'provers': {
      'encryption': (args) => proveEncryption(
        ZKTypes.SNARK,
        args,
      ),
      'hash': (args) => proveHash(ZKTypes.SNARK, args),
      'blur': (args) => proveBlur(ZKTypes.SNARK, args),
      'darkForest': (args) => proveDarkForest(ZKTypes.SNARK, args),
    },
    'verifiers': {
      'encryption': (proof) => verifyEncryption(ZKTypes.SNARK, proof),
      'hash': (proof) => verifyHash(ZKTypes.SNARK, proof),
      'blur': (proof) => verifyBlur(ZKTypes.SNARK, proof),
      'darkForest': (proof) => verifyDarkForest(ZKTypes.SNARK, proof),
    },
    'hash': mimcHash,
    'sharedKey': sharedKeySnark,
    'genSharedKey': genSharedKeySnark,
    'genKeys': genPrivKeySnarkAsync,
    'decrypt': decryptMimcAsync,
    'decryptKeyCiphertext':
      (
        ciphertext: Ciphertext,
        sharedKey: BigInt,
      ) => decryptKeyCiphertext(ciphertext, sharedKey, ZKTypes.SNARK),
    'decryptDarkForestCiphertext':
      (
        ciphertext: Ciphertext,
        sharedKey: BigInt,
      ) => decryptDarkForestCiphertext(ciphertext, sharedKey, ZKTypes.SNARK),
    'decryptMessageCiphertext':
      (
        ciphertext: Ciphertext,
        sharedKey: BigInt,
      ) => decryptMessageCiphertext(ciphertext, sharedKey, ZKTypes.SNARK),
  },
  [ZKTypes.STARK]: {
    'provers': {
      'encryption': (args) => proveEncryption(
        ZKTypes.STARK,
        args,
      ),
      'hash': (args) => proveHash(ZKTypes.STARK, args),
      'blur': (args) => proveBlur(ZKTypes.STARK, args),
      'darkForest': (args) => proveDarkForest(ZKTypes.STARK, args),
    },
    'verifiers': {
      'encryption': (proof) => verifyEncryption(ZKTypes.STARK, proof),
      'hash': (proof) => verifyHash(ZKTypes.STARK, proof),
      'blur': (proof) => verifyBlur(ZKTypes.STARK, proof),
      'darkForest': (proof) => verifyDarkForest(ZKTypes.STARK, proof),
    },
    'hash': pedersenHash,
    'sharedKey': sharedKeyStark,
    'genSharedKey': genSharedKeyStark,
    'genKeys': genPrivKeyStark,
    'decrypt': decryptPedersen,
    'decryptKeyCiphertext':
      (
        ciphertext: Ciphertext,
        sharedKey: BigInt,
      ) => decryptKeyCiphertext(ciphertext, sharedKey, ZKTypes.STARK),
    'decryptDarkForestCiphertext':
      (
        ciphertext: Ciphertext,
        sharedKey: BigInt,
      ) => decryptDarkForestCiphertext(ciphertext, sharedKey, ZKTypes.STARK),
    'decryptMessageCiphertext':
      (
        ciphertext: Ciphertext,
        sharedKey: BigInt,
      ) => decryptMessageCiphertext(ciphertext, sharedKey, ZKTypes.STARK),
  },
};

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

async function sharedKeySnark(
  privKey: PrivKey,
  pubKey: PubKey,
): Promise<BigInt> {
  return new Promise(resolve => {
    resolve(Keypair.genEcdhSharedKey(privKey, pubKey));
  });
}

async function sharedKeyStark(
  privKey: PrivKey,
  pubKey: PubKey,
): Promise<BigInt> {
  return new Promise(resolve => {
    resolve(computeSharedKey(privKey, pubKey));
  });
}

async function genSharedKeySnark(): Promise<BigInt> {
  const key1 = new Keypair();
  const key2 = new Keypair();

  const sharedKey = Keypair.genEcdhSharedKey(key1.privKey, key2.pubKey);
  return new Promise(resolve => {
    resolve(sharedKey);
  });
}

async function genSharedKeyStark(): Promise<BigInt> {
  return new Promise(resolve => {
    resolve(genSharedKey());
  });
}

async function genPrivKeySnarkAsync():
  Promise<{ privKey: BigInt; pubKey: BigInt[] }> {
  return new Promise(resolve => {
    const privKey = genPrivKeySnark();
    const pubKey = genPubKeySnark(privKey);
    const key = {
      privKey,
      pubKey,
    };
    resolve(key);
  });
}

async function genPrivKeyStark():
  Promise<{ privKey: BigInt; pubKey: BigInt[] }> {
  return new Promise(resolve => {
    resolve(genKeypair());
  });
}

function encryptMessage(message: BigInt, key: BigInt) {
  return encryptMimc([message], key);
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
  if (_key !== 'null') {
    const key = BigInt(_key);
    return key;
  } else {
    alert('Key for url not found');
  }
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

async function decryptDarkForestCiphertext(
  ciphertext: Ciphertext,
  sharedKey: BigInt,
  zk: ZKTypes,
): Promise<BigInt[]> {
  const message = await ZKFunctions[zk].decrypt(ciphertext, sharedKey);
  return message.map(BigInt);
}

async function decryptKeyCiphertext(
  ciphertext: Ciphertext,
  sharedKey: BigInt,
  zk: ZKTypes,
): Promise<BigInt> {
  const messageArray = await ZKFunctions[zk].decrypt(ciphertext, sharedKey);
  const messageNum = messageArray[0];
  return BigInt(messageNum);
}

async function decryptMimcAsync(
  ciphertext: Ciphertext,
  sharedKey: BigInt,
): Promise<BigInt[]> {
  return new Promise(resolve => {
    const res = decryptMimc(ciphertext, sharedKey);
    if (res[0] < BigInt(0)) {
      resolve([BigInt(res[0]) + BigInt(p)]);
    } else {
      resolve(res);
    }
  });
}

async function decryptPedersen(
  ciphertext: Ciphertext,
  sharedKey: BigInt,
): Promise<BigInt[]> {
  const output = ciphertext.data.map(
    (e: BigInt, i: number): Promise<BigInt> => {
      return new Promise(resolve => {
        pedersenHash(
          sharedKey,
          BigInt(ciphertext.iv) + BigInt(i),
        ).then(hash => {
          const diff = BigInt(e) - BigInt(hash);
          if (diff < BigInt(0)) {
            resolve(diff + FIELD_PRIME);
          } else {
            resolve(diff % FIELD_PRIME);
          }
        });
      });
    });
  return Promise.all(output);
}

async function encryptPedersen(
  plaintext: BigInt,
  sharedKey: BigInt,
): Promise<BigInt[]> {
  return new Promise(resolve => {
    pedersenHash(plaintext, BigInt(0)).then(hash1 => {
      pedersenHash(sharedKey, hash1).then(hash2 => {
        resolve([hash1, (BigInt(plaintext) + BigInt(hash2)) % FIELD_PRIME]);
      });
    });
  });
}

const encrypt = encryptPedersen;

async function decryptMessageCiphertext(
  ciphertext: Ciphertext,
  sharedKey: BigInt,
  zk: ZKTypes,
): Promise<string> {
  const messageArray = await ZKFunctions[zk].decrypt(ciphertext, sharedKey);
  const messageNum = messageArray[0];
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
  ZKFunctions,
  ciphertextAsCircuitInputs,
  getKey,
  setKey,
  blurImage,
  encryptMessage,
  encrypt,
  stringToNum,
  stringToBits,
  getPreimage,
  setPreimage,
  getCiphertext,
  setCiphertext,
  modPBigIntNative,
  serializeUrl,
  parseUrl,
};
