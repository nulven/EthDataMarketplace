import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { mimc7 } from 'circomlib';

import { ProfileContext } from './ContextProvider';
import { Button } from '../components/Button';
import { Large } from '../components/text';
import Spinner from '../components/Spinner';
import PropertyToggle from './PropertyToggle';
import { ContentInput } from './Content';
import {
  stringToNum,
  stringToBits,
  genSharedKey,
  encryptMessage,
  setCiphertext,
  setKey,
  blurImage,
} from '../utils/crypto';
import eth from '../utils/ethAPI';
import { addToIPFS, addSnark } from '../utils/ipfs';
import { proveHash, proveBlur, verifyBlur } from '../utils/prover';
import {
  ContentProperties,
  IpfsResponse,
  Snark,
} from '../types';


const Title = styled(Large)`
  margin-bottom: 10px;
`;

const NewTokenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 20%;
  margin-right: 20%;
  margin-top: 10%;
  height: 100%;
`;

const NewToken = (props) => {
  const [preimage, setPreimage] = useState('');
  const [property, setProperty] = useState<ContentProperties>(ContentProperties.HASH);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const sendToTokens = () => {
    props.history.push('/tokens');
  };

  const onSell = () => {
    setLoading(true);
    const price = BigInt(10);

    const commitProof = (proof: Snark) => {
      addSnark(proof).then((result: IpfsResponse) => {
        const url = result.path;
        setKey(url, sharedKey);
        eth.api.postUrl(url, keyHash, property, price)
          .then(() => {
            sendToTokens();
            setLoading(false);
          })
          .catch(error => {
            setLoading(false);
            alert(error.message);
          });
        localStorage.setItem(url, preimage);
      });
    }

    const sharedKey = BigInt(genSharedKey().toString().slice(1));
    const keyHash = mimc7.multiHash([sharedKey], BigInt(0));

    setLoadingMessage('generating proof');
    if (property === ContentProperties.HASH) {
      const numPreimage = stringToNum(preimage);
      const hash = mimc7.multiHash([numPreimage], BigInt(0));

      const ciphertext = encryptMessage(numPreimage, sharedKey);

      proveHash(numPreimage, sharedKey, hash).then(commitProof);
    } else if (property === ContentProperties.BLUR) {
      const preimageArray = preimage.split('');
      const blurredImage = blurImage(preimageArray, sharedKey);

      proveBlur(preimageArray, sharedKey, blurredImage).then(commitProof);
    }
  };

  return (
    <>
      {loading ?
        <Spinner loadingMessage={loadingMessage} />
        :
        <NewTokenWrapper>
          <Title>Sell your Token</Title>
          <PropertyToggle property={property} setProperty={setProperty} />
          <ContentInput
            property={property}
            preimage={preimage}
            setPreimage={setPreimage}
          />
          <Button onClick={onSell}>
            Submit Token
          </Button>
        </NewTokenWrapper>
      }
    </>
  );
};

export default NewToken;
