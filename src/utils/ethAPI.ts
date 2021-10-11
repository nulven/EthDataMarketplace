import * as dotenv from 'dotenv';
dotenv.config({ path: '/home/nulven/CairoDataMarketplace/.env' });
import { Contract, providers } from 'ethers';
import { Parsers } from './parsers';
import { modPBigIntNative } from './crypto';

import contractJSON from '../../public/contracts/Core.json';
import gettersContractJSON from '../../public/contracts/Getters.json';

import { OurErrors, SolidityErrors } from './errors';

import { PrivKey, PubKey } from 'maci-domainobjs';
import {
  ZKFunctions,
} from '../utils/crypto';
import {
  Ciphertext,
  Snark,
  Stark,
  ZKTypes,
} from '../types';

class EthConnection {
  provider: providers.Web3Provider | providers.JsonRpcProvider;
  signer;
  contract: Contract;
  gettersContract: Contract;
  gasPrice: number;
  gasLimit: number;
  api: any;
  dfApi: any;
  address: string;
  privateKey: Record<ZKTypes, BigInt>;
  publicKey: Record<ZKTypes, BigInt[]>;
  signerHook: any;
  salt: BigInt;

  constructor() {
    this.api = new EthAPI();
    this.dfApi = new EthAPI();
  }

  getCachedSettings() {
    const _address = localStorage.getItem('address');
    const address = _address !== 'null' ? _address : '';
    return address;
  }

  setCachedSettings() {
    localStorage.setItem('address', this.address);
  }

  public async setProvider(provider, setSigner) {
    this.provider = provider;
    this.signerHook = setSigner;
    const [address] = await provider.listAccounts();
    await this.setSigner(address);
  }

  public async setSigner(_address?: string) {
    const address = _address ? _address : this.getCachedSettings();
    if (this.provider) {
      if (address) {
        this.signer = this.provider.getSigner(address);
      } else {
        this.signer = this.provider.getSigner();
      }
      await this.setAddress();
      this.connect();
      this.api.init(
        this.contract,
        this.gettersContract,
        this.address,
        this.publicKey,
      );
      this.download();
      this.signerHook(this.signer);
    }
  }

  public download() {
    if (this.api.contract) {
      this.api.getSalt().then(salt => {
        this.salt = BigInt(salt.toString());
      });
    }
  }

  public async setAddress() {
    if (this.signer) {
      this.address = await this.signer.getAddress();
      await this.loadKeys();
      this.setCachedSettings();
    }
  }

  public async loadKeys() {
    let _privateKey;
    let _publicKey;
    this.privateKey = <Record<ZKTypes, BigInt>>{};
    this.publicKey = <Record<ZKTypes, BigInt[]>>{};
    Object.values(ZKTypes).forEach(async (zk) => {
      const privateKeyMaybe = localStorage.getItem(
        `${this.address}_private_key_${zk}`);
      const publicKeyMaybe = localStorage.getItem(
        `${this.address}_public_key_${zk}`);
      if (privateKeyMaybe && publicKeyMaybe) {
        _privateKey = privateKeyMaybe;
        _publicKey = publicKeyMaybe.split(',');
      } else {
        const keys = await ZKFunctions[zk].genPrivKey();
        _privateKey = keys.privKey;
        _publicKey = keys.pubKey;
        localStorage.setItem(`${this.address}_private_key_${zk}`, _privateKey);
        localStorage.setItem(`${this.address}_public_key_${zk}`, _publicKey);
      }

      this.privateKey[zk] = BigInt(_privateKey);
      this.publicKey[zk] = _publicKey.map(BigInt);
    });
  }

  public connect() {
    const contractABI = contractJSON.abi;
    const contractAddress = contractJSON.address;
    const gettersContractABI = gettersContractJSON.abi;
    const gettersContractAddress = gettersContractJSON.address;
    this.contract = new Contract(contractAddress, contractABI, this.signer);
    this.gettersContract = new Contract(
      gettersContractAddress,
      gettersContractABI,
      this.signer,
    );
  }

  async retrieveCiphertext(
    _keyCiphertext,
    publicKey: BigInt[],
    property: string,
    proof: Snark | Stark,
    zk: ZKTypes,
  ): Promise<[any, BigInt]> {
    const privKey = new PrivKey(this.privateKey[zk]);
    const pubKey = new PubKey(publicKey);
    const _sharedKey = await ZKFunctions[zk].sharedKey(privKey, pubKey);

    const _key = await ZKFunctions[zk].decryptKeyCiphertext(
      _keyCiphertext,
      _sharedKey,
    );

    const _ciphertext = Parsers[zk][property](proof).ciphertext;
    return [_ciphertext, _key];
  }
}

class EthAPI {

  contract: Contract;
  gettersContract: Contract;
  address: string;
  publicKey: BigInt[];

  constructor() {
    this.createAPI();
  }

  init(
    contract: Contract,
    gettersContract: Contract,
    address: string,
    publicKey: BigInt[],
  ) {
    this.contract = contract;
    this.gettersContract = gettersContract;
    this.address = address;
    this.publicKey = publicKey;
    this.createAPI();
  }

  public createAPI() {
    const functions = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(_ => _[0] === '_');
    functions.forEach(key => {
      const prop = this[key];
      if (typeof prop === 'function') {
        this[key.slice(1)] = (...args) => {
          if (this.contract) {
            return this.wrapper(this[key].bind(this))(...args);
          } else {
            return new Promise((resolve, reject) => {
              reject('this');
            });
          }
        };
      }
    });
  }

  wrapper(apiCall) {
    const fn = async (...args) => {
      try {
        const res = await apiCall(...args);
        return res;
      } catch (error) {
        console.log(error);
        const errorMessage = error.message.replace(/\\"/g, '"');
        const strList = errorMessage.match('(?<=error\\":).*(?=}", error)');
        if (!strList) {
          throw error;
        }
        const str = strList[0];
        const json = JSON.parse(str);
        const err = json.message;
        const message = err.split(': ')[1];
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
    return this.gettersContract.getProperties();
  }

  public async _getContent(contentId: BigInt) {
    return this.contract.getContent(contentId);
  }

  public async _getContents(): Promise<string[]> {
    return this.gettersContract.getContents();
  }

  public async _postUrl(
    url: string,
    keyHash: bigint,
    property: string,
    price: bigint,
    zk: ZKTypes,
  ) {
    await this.contract.postUrl(
      url,
      this.publicKey[zk],
      keyHash,
      property,
      price,
      zk,
      { gasLimit: 8000000 },
    );
  }

  public async _getCiphertext(token: BigInt): Promise<Ciphertext> {
    return new Promise(resolve => {
      this.gettersContract.getCiphertext(token).then(ciphertext => {
        resolve({
          iv: ciphertext[0],
          data: [ciphertext[1]],
        });
      });
    });
  }

  public async _buyToken(contentId: number, zk: ZKTypes) {
    return this.contract.buyToken(contentId, this.publicKey[zk], { value: 10 });
  }

  public async _getTokens(contentId: BigInt): Promise<bigint[]> {
    return new Promise((resolve) => {
      this.gettersContract.getTokens(contentId).then(tokens => {
        resolve(tokens);
      });
    });
  }


  redeemer;
  public async _redeem(proof, tokenId: number, zk: ZKTypes) {
    this.redeemer = zk === ZKTypes.SNARK ? this.redeemSnark : this.redeemStark;
    return this.redeemer(proof, tokenId);
  }

  public async redeemSnark(proof: Snark, tokenId: number) {
    const proofAsCircuitInput = processProof(
      proof.proof,
      // @ts-ignore
      proof.publicSignals.map(x => modPBigIntNative(x)),
    );
    return this.contract.redeem_snark(...proofAsCircuitInput, tokenId);
  }

  public async redeemStark(proof: Stark, tokenId: number) {
    return this.contract.redeem_stark(proof.programOutputs, tokenId);
  }

  public async _checkHash(hash: BigInt, salt: BigInt): Promise<boolean> {
    return new Promise(resolve => {
      this.contract.checkHash(hash, salt).then(res => {
        resolve(parseInt(res.owner.toString()) !== 0);
      });
    });
  }

  public async _getOwner(token, zk: ZKTypes): Promise<[]> {
    return new Promise((resolve) => {
      this.contract.ownerOf(token).then(owner => {
        this.gettersContract.getPublicKey(owner, zk).then(publicKey => {
          resolve(publicKey.map(_ => BigInt(_.toString())));
        });
      });
    });
  }

  public async _getCreator(url: string): Promise<string> {
    return this.gettersContract.getCreator(url);
  }

  public async _getProperty(url: string): Promise<string> {
    return this.gettersContract.getProperty(url);
  }

  public async _getPublicKey(address: string, zk: ZKTypes): Promise<bigint[]> {
    return new Promise((resolve) => {
      this.gettersContract.getPublicKey(address, zk).then(publicKey => {
        resolve(publicKey.map(_ => BigInt(_.toString())));
      });
    });
  }

  public async _checkNFT({ proof, publicSignals }): Promise<boolean> {
    const [a, b, c, input] = processProof(proof, publicSignals);
    return this.contract.checkNFT(a, b, c, input);
  }

  public async _checkCreator(url): Promise<boolean> {
    const creatorAddress = await this.gettersContract.getCreator(url);
    return this.address === creatorAddress;
  }

  public async _checkOwnership(contentId: BigInt): Promise<BigInt> {
    const tokens = await this.gettersContract.getTokens(contentId);
    return new Promise((resolve) => {
      let counter = 0;
      tokens.forEach(token => {
        this.contract.ownerOf(token.id).then(owner => {
          if (owner === this.address) {
            resolve(BigInt(token.id.toString()));
          } else if (counter === tokens.length-1) {
            resolve(BigInt(-1));
          } else {
            counter += 1;
          }
        });
      });
      if (tokens.length === 0) {
        resolve(BigInt(-1));
      }
    });
  }

  public async _getSalt(): Promise<BigInt> {
    //return this.gettersContract.getHashSalt();
    return new Promise(resolve => resolve(BigInt(0)));
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
