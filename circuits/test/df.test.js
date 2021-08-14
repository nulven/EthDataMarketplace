const { mimcsponge } = require('circomlib');
const fs = require('fs');
const { Keypair } = require('maci-domainobjs');

const x = '1';
const y = '1';

const key1 = new Keypair();
const key2 = new Keypair();

const sharedKey = Keypair.genEcdhSharedKey(key1.privKey, key2.pubKey);
const hash = mimcsponge.multiHash([x, y], BigInt(100), 1);

const input = {
  x,
  y,
  key: sharedKey.toString(),
  hash: hash.toString(),
  salt: '100',
};

fs.writeFile('./circuits/df/input.json', JSON.stringify(input), () => {});
