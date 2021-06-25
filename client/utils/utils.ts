import { eddsa } from 'circomlib';
const { prv2pub } = eddsa;


export function generateKey() {
  const privateKey = Math.floor(Math.random()*1000000);
  const publicKey = prv2pub(privateKey.toString());
  return { publicKey: publicKey, privateKey };
}
