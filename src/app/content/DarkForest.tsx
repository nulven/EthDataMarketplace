import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import assert from 'assert';

import TextInput from '../../components/TextInput';
import { Large } from '../../components/text';
import Resize from '../../components/Resize';

import {
  decryptDFCiphertext,
} from '../../utils/crypto';
import {
  proveDF,
  verifyDF,
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

const DFInput = (props: InputProps) => {

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
const DFCoordWrapper = styled.div`
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

const DFText = styled(Large)`
  font-size: 18px;
  flex: 5;
  padding: 10px;
`;

type DFCoordProps = {
  label: string;
  value: string;
}

const DFCoord = (props: DFCoordProps) => {
  return (
    <DFCoordWrapper>
      <Label>{props.label}</Label>
      <DFText>{props.value}</DFText>
    </DFCoordWrapper>
  );
};

type DFProps = {
  property: BigInt;
  message?: BigInt[];
}

const DFWrapper = styled.div`
  width: 100%;
`;

const DF = (props: DFProps) => {
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
    <DFWrapper>
      {props.message ?
        <>
          <DFCoord label={'x'} value={props.message[0].toString()} />
          <DFCoord label={'y'} value={props.message[1].toString()} />
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
    </DFWrapper>
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
  input: DFInput,
  display: DF,
  list: DF,
  decrypt: decryptDFCiphertext,
  computeProperty,
  prover: proveDF,
  verifier: verifyDF,
  assertProofInputs,
  assertContent,
  assertMessage,
};
export default json;
