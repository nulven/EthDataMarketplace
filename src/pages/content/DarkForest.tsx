import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import assert from 'assert';

import TextInput from '../../components/TextInput';
import { Large } from '../../components/text';
import Resize from '../../components/Resize';

import {
  decryptDarkForestCiphertext,
} from '../../utils/crypto';
import {
  proveDarkForest,
  verifyDarkForest,
} from '../../utils/prover';

import {
  InputProps,
} from '../../types/content';


const HashWrapper = styled.div`
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
`;

const HashText = styled(Large)`
  font-size: 18px;
`;

const DarkForestInput = (props: InputProps) => {

  useEffect(() => {
    props.setPreimage(',');
  }, []);

  const setDf = (index: number) => (value: string) => {
    const [x, y] = props.preimage.split(',');
    if (index === 0) {
      props.setPreimage(`${value},${y}`);
    } else if (index === 1) {
      props.setPreimage(`${x},${value}`);
    }
  };

  return (
    <>
      <TextInput
        onChange={setDf(0)}
        value={props.preimage.split(',')[0]}
        placeholder={''}
        label={'x'}
      />
      <TextInput
        onChange={setDf(1)}
        value={props.preimage.split(',')[1]}
        placeholder={''}
        label={'y'}
      />
    </>
  );
};
const DarkForestCoordWrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

const Label = styled.div`
  display: flex;
  flex: 1;
  min-width: 40px;
  background-color: ${props => props.theme.color.grey30};
  align-items: center;
  justify-content: center;
`;

const DarkForestText = styled(Large)`
  font-size: 18px;
  flex: 5;
  padding: 10px;
`;

type DarkForestCoordProps = {
  label: string;
  value: string;
}

const DarkForestCoord = (props: DarkForestCoordProps) => {
  return (
    <DarkForestCoordWrapper>
      <Label>{props.label}</Label>
      <DarkForestText>{props.value}</DarkForestText>
    </DarkForestCoordWrapper>
  );
};

type DarkForestProps = {
  property: BigInt;
  message?: BigInt[];
}

const DarkForestWrapper = styled.div`
  width: 100%;
`;

const DarkForest = (props: DarkForestProps) => {
  const [display, setDisplay] = useState(null);
  const [containerRef, setContainerRef] = useState(null);
  const [contentRef, setContentRef] = useState(null);

  useEffect(() => {
    const _display = props.property.toString();
    setDisplay(_display);
  }, [props]);

  const sliceFunction = (size) => {
    const hashArray = props.property.toString().split('');

    const halfSize = Math.floor((size-3) / 2);
    const hashFirstHalf = hashArray.slice(0, halfSize).join('');
    const hashLastHalf = hashArray.slice(hashArray.length - halfSize).join('');
    return `${hashFirstHalf}...${hashLastHalf}`;
  };

  return (
    <DarkForestWrapper>
      {props.message ?
        <>
          <DarkForestCoord label={'x'} value={props.message[0].toString()} />
          <DarkForestCoord label={'y'} value={props.message[1].toString()} />
        </>
        :
        <Resize
          containerRef={containerRef}
          contentRef={contentRef}
          slice={sliceFunction}
          display={display}
        >
          <HashWrapper ref={ref => {
            setContainerRef(ref);
          }}>
            <HashText ref={ref => {
              setContentRef(ref);
            }}>{display}</HashText>
          </HashWrapper>
        </Resize>
      }
    </DarkForestWrapper>
  );
};

const isCiphertext = (value) => {
  return typeof value.iv === 'bigint' &&
    (Array.isArray(value.data) && typeof value.data[0] === 'bigint');
};

const assertContent = (content) => {
  assert(isCiphertext(content.cipher));
  assert(typeof content.property === 'bigint');
};

const assertMessage = (message) => {
  assert(Array.isArray(message));
  assert(typeof message[0] === 'bigint');
  assert(message.length === 2);
};

import { mimcsponge } from 'circomlib';
import eth from '../../utils/ethAPI';
const computeProperty = (preimage) => {
  const preimageArray = preimage.split(',');
  //assert(Array.isArray(preimageArray));
  //assert(preimageArray.length === 1);
  const salt = eth.salt;
  //const salt = BigInt('100');
  const hash = mimcsponge.multiHash(preimageArray, salt, 1);
  return [...preimageArray, hash, salt];
};

const assertProofInputs = (args: any[]) => {
  assert(args.length === 5);
  assert(typeof args[0] === 'bigint');
  assert(typeof args[1] === 'bigint');
  assert(typeof args[2] === 'bigint');
  assert(typeof args[3] === 'bigint');
  assert(typeof args[4] === 'bigint');
};

const json = {
  input: DarkForestInput,
  display: DarkForest,
  list: DarkForest,
  decrypt: decryptDarkForestCiphertext,
  computeProperty,
  prover: proveDarkForest,
  verifier: verifyDarkForest,
  assertProofInputs,
  assertContent,
  assertMessage,
};
export default json;
