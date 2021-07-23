import {
  proveHash,
  proveBlur,
  verifyHash,
  verifyBlur,
} from '../utils/prover';

enum ContentProperties {
  HASH = 'hash',
  BLUR = 'blur',
}

enum EthFunctions {
  GET_URLS = 'getUrls',
  GET_URL_DATA = 'getUrlData',
  POST_URL = 'postUrl',
  GET_CIPHERTEXT = 'getCiphertext',
  BUY_TOKEN = 'buyToken',
  GET_TOKENS = 'getTokens',
  REDEEM = 'redeem',
  GET_OWNER = 'getOwner',
  CHECK_OWNERSHIP = 'checkOwnership',
  CHECK_NFT = 'checkNFT',
  CHECK_CREATOR = 'checkCreator',
  GET_CREATOR = 'getCreator',
  GET_PUBLIC_KEY = 'getPublicKey',
  GET_PROPERTY = 'getProperty',
  GET_PROPERTIES = 'getProperties',
}

const ContentProvers = {
  [ContentProperties.HASH]: proveHash,
  [ContentProperties.BLUR]: proveBlur,
}

const ContentVerifiers = {
  [ContentProperties.HASH]: verifyHash,
  [ContentProperties.BLUR]: verifyBlur,
}

enum TokenStates {
  UNPURCHASED = 'unpurchased',
  OWNED = 'owned',
  SELLER = 'seller',
  NULL = 'null',
}

interface Snark {
  proof: {
    pi_a: BigInt[],
    pi_b: BigInt[][],
    pi_c: BigInt[],
  };
  publicSignals: BigInt[];
}
const EmptySnark = {
  proof: {
    pi_a: [],
    pi_b: [[], []],
    pi_c: [],
  },
  publicSignals: [],
};

interface IpfsResponse {
  path: string;
  CID: any;
  size: number;
}

interface Ciphertext {
  iv: BigInt;
  data: BigInt[];
}


export {
  ContentProperties,
  ContentProvers,
  ContentVerifiers,
  TokenStates,
  Snark,
  EmptySnark,
  IpfsResponse,
  Ciphertext,
  EthFunctions,
};
