import React, { useState } from 'react';
import styled from 'styled-components';

import { Button } from '../components/Button';
import { Large } from '../components/text';
import Spinner from '../components/Spinner';
import TextInput from '../components/TextInput';
import Toggle from '../components/Toggle';
import PropertyToggle from '../app/PropertyToggle';
import { ContentInput, ContentElements } from './Content';
import {
  setKey,
  ZKFunctions,
} from '../utils/crypto';
import eth from '../utils/ethAPI';
import ipfs from '../utils/ipfs';

import {
  ContentProperties,
  ZKTypes,
  IpfsResponse,
  Snark,
  Stark,
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
  const [property, setProperty] =
    useState<ContentProperties>(ContentProperties.HASH);
  const [zk, setZK] =
    useState<ZKTypes>(ZKTypes.SNARK);
  const [price, setPrice] = useState<BigInt>(BigInt(0));
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const sendToTokens = () => {
    props.history.push('/tokens');
  };

  const onSell = async () => {
    setLoading(true);

    const commitProof = (proof: Snark | Stark) => {
      ipfs.addProof(proof, zk).then((result: IpfsResponse) => {
        let url = result.path;

        setKey(url, sharedKey);

        eth.api.postUrl(url, keyHash, property, price, zk)
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
    };

    const sharedKey = await ZKFunctions[zk].genSharedKey();
    const keyHash = await ZKFunctions[zk].hash(sharedKey, BigInt(-1));

    setLoadingMessage('generating proof');
    const {
      prover,
      computeProperty,
      assertProofInputs,
    } = ContentElements[property];
    const values = await computeProperty(preimage, sharedKey);
    const proofInputs = [sharedKey, ...values];
    assertProofInputs(proofInputs);
    prover[zk](proofInputs).then(commitProof);
  };

  const setPriceBigInt = (value: string) => {
    if (parseInt(value)) {
      setPrice(BigInt(value));
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
          <Toggle
            element={zk}
            elements={ZKTypes}
            setElement={setZK}
          />
          <ContentInput
            property={property}
            preimage={preimage}
            setPreimage={setPreimage}
          />
          <TextInput
            onChange={setPriceBigInt}
            value={price.toString()}
            placeholder={''}
            label={'Price'}
          />
          <Button style={{ width: '100%' }} onClick={onSell}>
            Submit Token
          </Button>
        </NewTokenWrapper>
      }
    </>
  );
};

export default NewToken;
