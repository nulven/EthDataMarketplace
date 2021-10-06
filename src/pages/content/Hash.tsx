import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import assert from 'assert';

import TextInput from '../../components/TextInput';
import { Large } from '../../components/text';
import Resize from '../../components/Resize';

import {
  decryptMessageCiphertext,
} from '../../utils/crypto';
import {
  proveHash,
  verifyHash,
} from '../../utils/prover';
import {
  stringToNum,
} from '../../utils/crypto';

import { InputProps } from '../../types/content';


const HashWrapper = styled.div`
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
`;

const HashText = styled(Large)`
  font-size: 18px;
`;

type HashProps = {
  property: BigInt;
  message?: string;
}

const Hash = (props: HashProps) => {
  const hashString = props.property.toString();
  const [display, setDisplay] = useState(null);
  const [containerRef, setContainerRef] = useState(null);
  const [contentRef, setContentRef] = useState(null);

  useEffect(() => {
    const _display = props.message ? props.message : hashString;
    setDisplay(_display);
  }, [props]);

  const sliceFunction = (size) => {
    const hashArray = hashString.split('');

    const halfSize = Math.floor((size-3) / 2);
    const hashFirstHalf = hashArray.slice(0, halfSize).join('');
    const hashLastHalf = hashArray.slice(hashArray.length - halfSize).join('');
    return `${hashFirstHalf}...${hashLastHalf}`;
  };


  return (
    <Resize
      containerRef={containerRef}
      contentRef={contentRef}
      slice={sliceFunction}
      display={display}
    >
      <HashWrapper ref={setContainerRef}>
        <HashText ref={setContentRef}>{display}</HashText>
      </HashWrapper>
    </Resize>
  );
};

const HashInput = (props: InputProps) => {

  useEffect(() => {
    props.setPreimage('');
  }, []);

  return (
    <TextInput
      onChange={props.setPreimage}
      value={props.preimage}
      placeholder={''}
    />
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

const assertMessage = (message) => assert(typeof message === 'string');

const computeProperty = (preimage): any[] => {
  const numPreimage = stringToNum(preimage);
  const salt = BigInt('0');
  return [numPreimage, salt];
};

const assertProofInputs = (args: any[]) => {
  assert(args.length === 3);
  assert(typeof args[0] === 'bigint');
  assert(typeof args[1] === 'bigint');
  assert(typeof args[2] === 'bigint');
};

const json = {
  input: HashInput,
  display: Hash,
  list: Hash,
  decrypt: decryptMessageCiphertext,
  computeProperty,
  prover: proveHash,
  verifier: verifyHash,
  assertProofInputs,
  assertContent,
  assertMessage,
};
export default json;
