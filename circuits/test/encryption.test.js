const fs = require('fs');
const { Keypair } = require('maci-domainobjs');
const { mimc7 } = require('circomlib');

const key1 = new Keypair();
const key2 = new Keypair();
const sharedKey = Keypair.genEcdhSharedKey(key1.privKey, key2.pubKey);
const hash = mimc7.multiHash([sharedKey], BigInt(0));

const input = {
  private_key: key1.privKey.asCircuitInputs(),
  key: sharedKey.toString(),
  hash: hash.toString(),
  public_key: key2.pubKey.asCircuitInputs(),
};

fs.writeFile(
  './circuits/encryption/input.json',
  JSON.stringify(input),
  () => {},
);
