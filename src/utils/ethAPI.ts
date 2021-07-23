import * as dotenv from 'dotenv';
dotenv.config({ path: '/home/nulven/EthDataMarketplace/.env' });
import { Contract, providers, Wallet } from 'ethers';
import { modPBigIntNative } from './mimc';
import fetch from 'node-fetch';
import fs from 'fs';
import config from '../../config'

import contractJSONProd from '../../contracts/deploy/Core.json';
import contractJSONDev from '../../contracts/json/Core.json';

import { OurErrors, SolidityErrors } from './errors';
import EventEmitter from 'event';

import { genPrivKey, genPubKey } from 'maci-crypto';
import { Keypair, PrivKey, PubKey } from 'maci-domainobjs';
import {
  stringToNum,
  stringToBits,
  getPreimage,
  decryptKeyCiphertext,
  decryptMessageCiphertext,
  encryptMessage,
  getCiphertext,
  getKey,
  blurImage,
} from '../utils/crypto';
import {
  ContentProperties,
  ContentVerifiers,
  TokenStates,
  Snark,
  EmptySnark,
  Ciphertext,
} from '../types'; 

class EthConnection {
  provider: providers.Web3Provider | providers.JsonRpcProvider;
  signer;
  contract: Contract;
  gasPrice: number;
  gasLimit: number;
  api: any;
  address: string;
  privateKey: BigInt;
  publicKey: BigInt[];

  constructor() {
    this.api = new EthAPI();
  }

  public async setProvider(provider, setSigner) {
    this.provider = provider;
    await this.setSigner(setSigner);
    this.connect('Core');
    this.api.init(this.contract, this.address, this.publicKey);
    setSigner(this.signer);
  }

  public async setSigner(setSigner) {
    if (this.provider) {
      this.signer = this.provider.getSigner();
      await this.setAddress();
    }
  }

  public async setAddress() {
    if (this.signer) {
      this.address = await this.signer.getAddress();
      this.loadKeys();
    }
  }

  public loadKeys() {
    let _privateKey;
    const privateKeyMaybe = localStorage.getItem(`${this.address}_private_key`);
    if (privateKeyMaybe) {
      _privateKey = privateKeyMaybe;
    } else {
      _privateKey = genPrivKey().toString().slice(0,-1);
      localStorage.setItem(`${this.address}_private_key`, _privateKey);
    }
    const _publicKey: bigint[] = genPubKey(BigInt(_privateKey)).map(_ => BigInt(_));

    this.privateKey = BigInt(_privateKey);
    this.publicKey = _publicKey;
  }

  public connect(contractName) {
    const { env } = config;
    const contractJSON = env === 'production' ? contractJSONProd : contractJSONDev;
    const contractABI = contractJSON.abi;
    const contractAddress = contractJSON.address;
    const contract = new Contract(contractAddress, contractABI, this.signer);
    this.contract = contract;
  }

  retrieveCiphertext(_keyCiphertext, publicKey: BigInt[], property: string, snark: Snark): [any, BigInt] {
    const privKey = new PrivKey(this.privateKey);
    const pubKey = new PubKey(publicKey);
    const sharedKey = Keypair.genEcdhSharedKey(privKey, pubKey);

    const _key = decryptKeyCiphertext(_keyCiphertext, sharedKey);

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
    }
  }
}

class EthAPI {

  contract: Contract;
  address: string;
  publicKey: BigInt[];

  constructor() {
    this.createAPI();
  }

  init(contract: Contract, address: string, publicKey: BigInt[]) {
    this.contract = contract;
    this.address = address;
    this.publicKey = publicKey;
    this.createAPI();
  }

  public createAPI() {
    const functions = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(_ => _[0] === '_');
    functions.forEach(key => {
      const prop = this[key];
      if (typeof prop === 'function') {
        const origProp = prop;
        this[key.slice(1)] = (...args) => {
          if (this.contract) {
            return this.wrapper(this[key].bind(this))(...args);
          }
        }
      }
    });
  }

  wrapper(apiCall) {
    const fn = async (...args) => {
      try {
        const res = await apiCall(...args);
        return res;
      } catch (error) {
        const errorMessage = error.message.replace(/\\"/g, '"');
        const strList = errorMessage.match('(?<=error\\":).*(?=}", error)');
        if (!strList) {
          throw error;
        }
        const str = strList[0];
        const json = JSON.parse(str);
        const err = json.message;
        const [type, message] = err.split(': ');
        const solidityError = SolidityErrors[message];
        const ourError = OurErrors[solidityError];
        if (ourError) {
          throw ourError();
        } else {
          throw OurErrors['SolidityError'](message);
        }
      }
    };
    return fn;
  }

  public async _getProperties(): Promise<string[]> {
    return this.contract.getProperties();
  }

  public async _getUrls(): Promise<string[]> {
    return this.contract.getUrls();
  }

  public async _getUrlData(): Promise<string[]> {
    return this.contract.getUrlData();
  }

  public async _postUrl(
    url: string,
    keyHash: bigint,
    property: string,
    price: bigint,
  ) {
    await this.contract.postUrl(
      url,
      this.publicKey,
      keyHash,
      property,
      price,
    );
  }

  public async _getCiphertext(token: bigint) {
    return this.contract.getCiphertext(token);
  }

  public async _buyToken(url: string) {
    return this.contract.buyToken(url, this.publicKey, { value: 10 });
  }

  public async _getTokens(url: string): Promise<bigint[]> {
    return new Promise((resolve, reject) => {
      this.contract.getTokens(url).then(tokens => {
        resolve(tokens.map(token => {
          return BigInt(token.toString());
        }));
      });
    });
  }

  public async _redeem(proof, publicSignals, tokenId: number) {
    const proofAsCircuitInput = processProof(
      proof,
      publicSignals.map(x => modPBigIntNative(x))
    );
    return this.contract.redeem(...proofAsCircuitInput, tokenId); 
  }

  public async _getOwner(token): Promise<[]> {
    return new Promise((resolve, reject) => {
      this.contract.ownerOf(token).then(owner => {
        this.contract.getPublicKey(owner).then(publicKey => {
          resolve(publicKey.map(_ => BigInt(_.toString())));
        });
      });
    });
  }

  public async _getCreator(url: string): Promise<string> {
    return this.contract.getCreator(url);
  }

  public async _getProperty(url: string): Promise<string> {
    return this.contract.getProperty(url);
  }

  public async _getPublicKey(address: string): Promise<bigint[]> {
    return new Promise((resolve, reject) => {
      this.contract.getPublicKey(address).then(publicKey => {
        resolve(publicKey.map(_ => BigInt(_.toString())));
      });
    });
  }

  public async _checkNFT({ proof, publicSignals }): Promise<boolean> {
    const [a, b, c, input] = processProof(proof, publicSignals);
    return this.contract.checkNFT(a, b, c, input);
  }

  public async _checkCreator(url): Promise<boolean> {
    const creatorAddress = await this.contract.getCreator(url);
    return this.address === creatorAddress;
  }

  public async _checkOwnership(url: string): Promise<bigint> {
    const tokens = await this.contract.getTokens(url);
    return new Promise((resolve, reject) => {
      let counter = 0;
      tokens.forEach(token => {
        this.contract.ownerOf(token).then(owner => {
          if (owner === this.address) {
            resolve(BigInt(token.toString()));
          } else if (counter === tokens.length-1) {
            resolve(BigInt(0));
          } else {
            counter += 1;
          }
        });
      });
      if (tokens.length === 0) {
        resolve(BigInt(0));
      }
    });
  }
}

const processProof = (snarkProof, publicSignals) => {
  return [
    snarkProof.pi_a.slice(0, 2), // pi_a
    [
      snarkProof.pi_b[0].slice(0).reverse(),
      snarkProof.pi_b[1].slice(0).reverse(),
    ], // pi_b
    snarkProof.pi_c.slice(0, 2), // pi_c
    publicSignals.map((signal) => signal.toString(10)), // input
  ];
};


const eth = new EthConnection();
export default eth;
