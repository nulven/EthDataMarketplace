import ipfsAPI from 'ipfs-http-client';
import { BufferList } from 'bl';

import {
  Snark,
  Stark,
  IpfsResponse,
} from '../types';
import config from '../../config';


const ZK = config.zk;

class IpfsConnection {
  api: any;
  host: string = 'localhost';
  protocol: string = 'http';
  infuraProjectId: string;
  infuraProjectSecret: string;

  constructor() {
    this.getCachedSettings();
    this.setApi();
  }

  getCachedSettings() {
    const _host = localStorage.getItem('ipfs.host');
    const _protocol = localStorage.getItem('ipfs.protocol');
    const _infuraProjectId = localStorage.getItem('ipfs.infuraProjectId');
    const _infuraProjectSecret =
      localStorage.getItem('ipfs.infuraProjectSecret');
    this.host = _host !== 'null' ? _host : 'localhost';
    this.protocol = _protocol !== 'null' ? _protocol : 'http';
    this.infuraProjectId = _infuraProjectId !== 'null' ?
      _infuraProjectId : '';
    this.infuraProjectSecret = _infuraProjectSecret !== 'null' ?
      _infuraProjectSecret : '';
  }

  setCachedSettings(): void {
    localStorage.setItem('ipfs.host', this.host);
    localStorage.setItem('ipfs.protocol', this.protocol);
    localStorage.setItem('ipfs.infuraProjectId', this.infuraProjectId);
    localStorage.setItem('ipfs.infuraProjectSecret', this.infuraProjectSecret);
  }

  async checkConnection(): Promise<boolean> {
    return new Promise(resolve => {
      this.addToIpfs('test').then(() => {
        resolve(true);
      }).catch(() => {
        resolve(false);
      });
    });
  }

  setApi() {
    this.api = ipfsAPI.create({
      host: this.host,
      port: 5001,
      protocol: this.protocol,
    });
    /*
    const auth = 'Basic ' +
      Buffer.from(`${this.infuraProjectId}:${this.infuraProjectSecret}`)
        .toString('base64');
    this.api = ipfsAPI.create({
      host: this.host,
      port: 5001,
      protocol: this.protocol,
      headers: {
        authorization: auth,
      },
    });
    */
    this.setCachedSettings();
  }

  updateSettings(
    host: string,
    protocol: string,
    infuraProjectId: string,
    infuraProjectSecret: string,
  ) {
    this.host = host;
    this.protocol = protocol;
    this.infuraProjectId = infuraProjectId;
    this.infuraProjectSecret = infuraProjectSecret;
    this.setApi();
  }

  public async getFromIpfs(url: string) {
    for await (const file of this.api.get(url)) {

      // @ts-ignore
      if (!file.content) continue;
      const content = new BufferList();
      // @ts-ignore
      for await (const chunk of file.content) {
        content.append(chunk);
      }
      return content;
    }
  }

  public async getProof(url: string): Promise<Snark | Stark> {
    return this.getter(url);
  }

  getter = ZK === 'snark' ? this.getSnark : this.getStark;

  public async getSnark(url: string): Promise<Snark> {
    return new Promise(resolve => {
      this.getFromIpfs(url).then(content => {
        const jsonString = content.toString();
        const json = JSON.parse(jsonString);
        const snark = {
          proof: {
            pi_a: json.proof.pi_a.map(BigInt),
            pi_b: json.proof.pi_b.map(_ => _.map(BigInt)),
            pi_c: json.proof.pi_c.map(BigInt),
          },
          publicSignals: json.publicSignals.map(BigInt),
        };
        resolve(snark);
      });
    });
  }

  public async getStark(url: string): Promise<Stark> {
    return new Promise(resolve => {
      this.getFromIpfs(url).then(content => {
        const jsonString = content.toString();
        const json = JSON.parse(jsonString);
        const stark = {
          fact: json.fact,
          programOutputs: json.programOutputs.map(BigInt),
        };
        resolve(stark);
      });
    });
  }

  public async addToIpfs(fileToUpload): Promise<IpfsResponse> {
    return new Promise((resolve) => {
      this.api.add(Buffer.from(fileToUpload)).then(result => {
        resolve(result);
      });
    });
  }

  adder = ZK === 'snark' ? this.addSnark : this.addStark;

  public async addProof(json): Promise<IpfsResponse> {
    return this.adder(json);
  }

  async addSnark(json: Snark): Promise<IpfsResponse> {
    return new Promise((resolve) => {
      this.addToIpfs(JSON.stringify(json)).then(result => {
        resolve(result);
      });
    });
  }

  async addStark(json: Stark): Promise<IpfsResponse> {
    const newJson = {
      fact: json.fact,
      programOutputs: json.programOutputs.map(_ => _.toString()),
    };
    return new Promise(resolve => {
      this.addToIpfs(JSON.stringify(newJson)).then(result => {
        resolve(result);
      });
    });
  }
}

const ipfs = new IpfsConnection();
export default ipfs;
