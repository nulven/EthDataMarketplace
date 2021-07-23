import React, { useContext, useState, useMemo, useEffect } from 'react';
import { eddsa } from 'circomlib';
const { prv2pub } = eddsa;
import { genPrivKey, genPubKey } from 'maci-crypto';
import eth from '../utils/ethAPI';

declare global {
  interface Window { web3: any; signer: any; ethereum: any; }
  interface Directory { content: any; }
}

type Props = {
  children?: any;
  profile: Object;
}

export const ProfileContext = React.createContext({
  address: '',
  addresses: [],
  publicKey: [BigInt(0), BigInt(0)],
  privateKey: BigInt(0),
  setAddress: (value: string) => {},
});

const ProfileProvider = (props: Props) => {
  const [address, setAddress] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [publicKey, setPublicKey] = useState([BigInt(0), BigInt(0)]);
  const [privateKey, setPrivateKey] = useState(BigInt(0));
  const [trigger, setTrigger] = useState(0);

  const loadKeys = (address: string) => {
    let _privateKey;
    const privateKeyMaybe = localStorage.getItem(`${address}_private_key`);
    if (privateKeyMaybe) {
      _privateKey = privateKeyMaybe;
    } else {
      _privateKey = genPrivKey().toString().slice(0,-1);
      localStorage.setItem(`${address}_private_key`, _privateKey);
    }
    const _publicKey: bigint[] = genPubKey(BigInt(_privateKey)).map(_ => BigInt(_));

    return { privateKey: BigInt(_privateKey), publicKey: _publicKey };
  };

  const changeAddress = (address: string) => {
    const keys = loadKeys(address);
    localStorage.setItem('address', address);
    setPrivateKey(keys.privateKey);
    setPublicKey(keys.publicKey);
    eth.setSigner(address);
    setAddress(address);
  };

  return (
    <ProfileContext.Provider value={{
      address,
      addresses,
      publicKey,
      privateKey,
      setAddress: changeAddress,
    }}>
      {props.children}
    </ProfileContext.Provider>
  );
};


export default ProfileProvider;
