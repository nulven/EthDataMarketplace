const fs = require('fs');
const { Keypair } = require('maci-domainobjs');

const key1 = new Keypair();
const key2 = new Keypair();
const sharedKey = Keypair.genEcdhSharedKey(key1.privKey, key2.pubKey);

const input = {
  seller_private_key: key1.privKey.asCircuitInputs(),
  key: sharedKey.toString(),
  buyer_public_key: key2.pubKey.asCircuitInputs(),
};

fs.writeFile(
  './circuits/encryption/input.json',
  JSON.stringify(input),
  () => {},
);
