import ipfsAPI from 'ipfs-http-client';
import { BufferList } from 'bl';

const ipfs = ipfsAPI.create({ host: 'localhost', port: 5001, protocol: 'http' });

export async function getFromIPFS(hashToGet) {
  for await (const file of ipfs.get(hashToGet)) {

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

export async function getSnark(url: string) {
  return new Promise((resolve, reject) => {
    getFromIPFS(url).then(content => {
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

export async function addToIPFS(fileToUpload) {
  return new Promise((resolve, reject) => {
    ipfs.add(Buffer.from(fileToUpload)).then(result => {
      resolve(result);
    });
  });
}

export async function addSnark(json) {
  return new Promise((resolve, reject) => {
    addToIPFS(JSON.stringify(json)).then(result => {
      resolve(result);
    });
  });
}
