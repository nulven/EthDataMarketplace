const { randomBytes } = require('crypto');
const { prv2pub } = require('./eddsa');
const { mulPointEscalar } = require('./babyjub');

const STARK_FIELD_SIZE = BigInt('3618502788666131213697322783095070105623107215331596699973092056135872020481');

const lim = BigInt('0x10000000000000000000000000000000000000000000000000000000000000000');

const min = (lim - STARK_FIELD_SIZE) % STARK_FIELD_SIZE;

const genRandomBabyJubValue = () => {

  let rand;
  while (true) {
    rand = BigInt('0x' + randomBytes(32).toString('hex'));

    if (rand >= min) {
      break;
    }
  }

  const privKey = rand % STARK_FIELD_SIZE;
  //assert(privKey < STARK_FIELD_SIZE);

  return privKey;
};

/*
type PrivKey = BigInt
type PubKey = BigInt[]

interface Keypair {
  privKey: PrivKey;
  pubKey: PubKey;
}
*/

const genPrivKey = () => {

  return genRandomBabyJubValue();
};

const bigInt2Buffer = (i) => {
  let hexStr = i.toString(16);
  while (hexStr.length < 64) {
    hexStr = '0' + hexStr;
  }
  return Buffer.from(hexStr, 'hex');
};

const genPubKey = (privKey) => {
  privKey = BigInt(privKey.toString());
  //assert(privKey < STARK_FIELD_SIZE);
  return prv2pub(bigInt2Buffer(privKey));
};

const genKeypair = () => {
  const privKey = genPrivKey();
  const pubKey = genPubKey(privKey);

  const Keypair = { privKey, pubKey };

  return Keypair;
};

function pruneBuffer(_buff) {
  const buff = Buffer.from(_buff);
  buff[0] = buff[0] & 0xF8;
  buff[31] = buff[31] & 0x7F;
  buff[31] = buff[31] | 0x40;
  return buff;
}

const createBlakeHash = require('blake-hash');
const ff = require('ffjavascript');
const formatPrivKeyForBabyJub = (privKey) => {
  const sBuff = pruneBuffer(
    createBlakeHash('blake512').update(
      bigInt2Buffer(privKey),
    ).digest().slice(0,32),
  );
  const s = ff.utils.leBuff2int(sBuff);
  return ff.Scalar.shr(s, 3);
};

const genEcdhSharedKey = (
  privKey,
  pubKey,
) => {
  return mulPointEscalar(pubKey, formatPrivKeyForBabyJub(privKey))[0];
};

const key1 = genKeypair();
const key2 = genKeypair();

const shared_key1 = genEcdhSharedKey(key1.privKey, key2.pubKey);
const shared_key2 = genEcdhSharedKey(key2.privKey, key1.pubKey);
console.log(shared_key1);
console.log(shared_key2);
