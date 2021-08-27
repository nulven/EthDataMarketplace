import * as dotenv from 'dotenv';
dotenv.config({ path: '/home/nulven/EthDataMarketplace/.env' });
import contractAddress from '../../public/cairo.json';
import keys from '../../public/keys.json';
import {
  serializeUrl,
  parseUrl,
  decryptKeyCiphertextPedersen,
} from './crypto';
import { Keypair, PrivKey, PubKey } from 'maci-domainobjs';
import {
  ContentProperties,
  Ciphertext,
  Snark,
} from '../types';


class CairoConnection {
  contract: string;
  contractAddress: string;
  privateKey: BigInt;
  publicKey: BigInt[];
  address: string;
  api: CairoAPI;

  constructor() {
    this.contract = 'main2';
    this.contractAddress = contractAddress.address;
    this.privateKey = BigInt(keys['key1']['priv_key']);
    this.publicKey = keys['key1']['pub_key'].map(BigInt);
    this.address = this.publicKey[0].toString();
    this.api = new CairoAPI(
      this.address,
      this.publicKey,
      this.contractAddress,
      this.contract,
    );
  }

  getAddresses() {
    const addresses = [];
    addresses.push(keys['key1']['pub_key'].map(BigInt)[0]);
    addresses.push(keys['key2']['pub_key'].map(BigInt)[0]);
    return addresses;
  }

  setSigner(address) {
    this.address = address;
    if (keys['key1']['pub_key'][0] == address) {
      this.privateKey = BigInt(keys['key1']['priv_key']);
      this.publicKey = keys['key1']['pub_key'].map(BigInt);
    } else {
      this.privateKey = BigInt(keys['key2']['priv_key']);
      this.publicKey = keys['key2']['pub_key'].map(BigInt);
    }
  }

  async retrieveCiphertext(
    _keyCiphertext,
    publicKey: BigInt[],
    property: string,
    snark: Snark,
  ): Promise<[any, BigInt]> {
    const privKey = new PrivKey(this.privateKey);
    const pubKey = new PubKey(publicKey);
    const sharedKey = Keypair.genEcdhSharedKey(privKey, pubKey);

    const _key = await decryptKeyCiphertextPedersen(_keyCiphertext, sharedKey);

    const { publicSignals } = snark;
    if (property === ContentProperties.HASH) {
      const _hashCiphertext = {
        iv: BigInt(publicSignals[1]),
        data: [BigInt(publicSignals[2])],
      };
      return [_hashCiphertext, _key];
    } else if (property === ContentProperties.BLUR) {
      const _blurredImage = publicSignals.slice(1, 17).map(Number);
      return [_blurredImage, _key];
    } else if (property === ContentProperties.DF) {
      const _hashCiphertext = {
        iv: BigInt(publicSignals[1]),
        data: [
          BigInt(publicSignals[2]),
          BigInt(publicSignals[3]),
        ],
      };
      return [_hashCiphertext, _key];
    }
  }
}

import { post } from './api';
class CairoAPI {
  address: string;
  publicKey: BigInt[];
  contractAddress: string;
  contract: string;

  constructor(address, publicKey, contractAddress, contract) {
    this.address = address;
    this.publicKey = publicKey;
    this.contractAddress = contractAddress;
    this.contract = contract;
  }

  async transact(type, func, inputs) {
    console.log('inputs', inputs);
    console.log('type', type);
    console.log('func', func);
    console.log('');
    const x = await post('http://localhost:5002', {
      type,
      contractAddress: this.contractAddress,
      contract: this.contract,
      func,
      inputs,
    });
    console.log('output', x);
    return x;
  }

  async invoke(func, inputs=[]) {
    return this.transact('invoke', func, inputs);
  }

  async call(func, inputs=[]) {
    return this.transact('call', func, inputs);
  }

  async getPublicKey(address) {
    return this.call('getPublicKey', [address]);
  }

  async getCiphertext(tokenId) {
    return this.call('getCiphertext', [tokenId]);
  }

  async getUrl(index) {
    return this.call('getUrl', [index]);
  }

  async getUrlData(url) {
    const _url = serializeUrl(url);
    return this.call('getUrlData', [_url]);
  }

  async getUrls() {
    const numOfUrls = await this.call('getUrlIndex');
    const urls = [];
    for (let i = 0; i < numOfUrls; i++) {
      const url = await this.getUrl(i);
      urls.push(parseUrl(url));
    }
    return urls;
  }

  async getUrlsData() {
    const numOfUrls = await this.call('getUrlIndex');
    const data = [];
    for (let i = 0; i < numOfUrls; i++) {
      const url = await this.getUrl(i);
      const urlData = await this.getUrlData(url);
      data.push(urlData);
    }
    return data;
  }

  async buyToken(buyer, url, publicKey) {
    const _url = serializeUrl(url);
    return this.invoke('buyToken', [this.address, _url, publicKey]);
  }

  async getToken(url, index) {
    const _url = serializeUrl(url);
    return this.call('getToken', [_url, index]);
  }

  async getTokens(url) {
    const numOfTokens = await this.call('getNumOfTokens', [url]);
    const tokens = [];
    for (let i = 0; i < numOfTokens; i++) {
      const token = this.getToken(url, i);
      tokens.push(token);
    }
    return tokens;
  }

  async getOwner(token) {
    const owner = await this.call('ownerOf', [token]);
    return this.getPublicKey(owner);
  }
  async getProperty(url) {
    const _url = serializeUrl(url);
    return this.call('getProperty', [_url]);
  }

  async getProperties() {
    const numOfProperties = await this.call('getNumOfProperties');
    const properties = [];
    for (let i = 0; i < numOfProperties; i++) {
      const property = await this.call('getPropertyId', [i]);
      properties.push(property);
    }
    return properties;
  }

  async getCreator(url) {
    const _url = serializeUrl(url);
    return this.call('getCreator', [_url]);
  }

  async postUrl(
    url: string,
    keyHash: bigint,
    property: string,
    price: bigint,
  ) {
    const _url = serializeUrl(url);
    const _publicKey = this.publicKey.map(_ => _.toString());
    return this.invoke(
      'postUrl',
      [this.address, ..._url, ..._publicKey, keyHash.toString(), '0', price.toString()],
    );
  }

  async redeem(tokenId) {
    return this.invoke('redeem', [tokenId]);
  }
}

const cairo = new CairoConnection();
export default cairo;
