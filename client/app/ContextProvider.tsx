import React, { useContext, useState, useMemo, useEffect } from 'react';
import { eddsa } from 'circomlib';
const { prv2pub } = eddsa;


type Props = {
  children?: any;
  profile: Object;
}

export const ProfileContext = React.createContext({
  publicKey: '',
  privateKey: '',
  setPrivateKey: () => {},
});

const ProfileProvider = (props: Props) => {
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    setPublicKey(prv2pub(privateKey));
  }, [privateKey]);

  return (
    <ProfileContext.Provider value={{
      publicKey,
      privateKey,
      setPrivateKey,
    }}>
      {props.children}
    </ProfileContext.Provider>
  );
};


export default ProfileProvider;
