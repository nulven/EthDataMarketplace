import React, { useEffect } from 'react';
import styled from 'styled-components';
import assert from 'assert';

import {
  blurImage,
} from '../../utils/crypto';
import {
  proveBlur,
  verifyBlur,
} from '../../utils/prover';

import {
  InputProps,
} from '../../types/content';


type PixelProps = {
  bit: number;
}

const Pixel = styled.div<PixelProps>`
  display: flex;
  flex: 1;
  height: 100%;
  background-color: ${props => (props.bit === 0 ?
    'black' : 'white')};
`;

type ImageWrapperProps = {
  height: string;
}

const ImageWrapper = styled.div<ImageWrapperProps>`
  justify-content: space-between;
  border: 1px solid black;
  display: flex;
  flex-direction: row;
  height: ${props => props.height};
  width: 100%;
  align-items: center;
  box-sizing: border-box;
`;

type ImageProps = {
  property: number[];
  height: string;
  message?: number[];
}

const Image = (props: ImageProps) => {
  const bits = props.message ? props.message : props.property;

  return (
    <ImageWrapper height={props.height} >
      {bits.map((bit, index) => (
        <Pixel bit={bit} key={index} />
      ))}
    </ImageWrapper>
  );
};

type ImageLargeProps = {
  property: number[];
  message?: number[];
}

const ImageLarge = (props: ImageLargeProps) => {
  return (
    <Image height={'100px'} property={props.property} message={props.message} />
  );
};

const ImageSmall = (props: ImageLargeProps) => {
  return (
    <Image height={'100%'} property={props.property} message={props.message} />
  );
};
const ImageInput = (props: InputProps) => {

  useEffect(() => {
    props.setPreimage('0000000000000000');
  }, []);

  const onChange = (index: number) => () => {
    let preimageArray = props.preimage.split('').map(Number);
    preimageArray[index] = (preimageArray[index] + 1) % 2;
    const newPreimage = preimageArray.join('');
    props.setPreimage(newPreimage);
  };

  return (
    <>
      <ImageWrapper height={'100px'} >
        {props.preimage.split('').map((bit, index) => {
          return (
            <Pixel
              key={index}
              bit={parseInt(bit)}
              onClick={onChange(index)}
            />
          );
        })}
      </ImageWrapper>
      <span style={{ marginBottom: '10px' }} />
    </>
  );
};

const isNumberArray = (value) => {
  return Array.isArray(value) &&
    typeof value[0] === 'number';
};

const assertContent = (content) => {
  assert(isNumberArray(content.cipher));
  assert(isNumberArray(content.property));
};

const assertMessage = isNumberArray;

const computeProperty = (preimage, key) => {
  const preimageArray = preimage.split('').map(Number);
  const blurredImage = blurImage(preimageArray, key);
  return [preimageArray, blurredImage];
};

const assertProofInputs = (args: any[]) => {
  assert(args.length === 3);
  assert(typeof args[0] === 'bigint');
  assert(isNumberArray(args[1]));
  assert(isNumberArray(args[2]));
};

const json = {
  input: ImageInput,
  display: ImageLarge,
  list: ImageSmall,
  decrypt: blurImage,
  computeProperty,
  prover: proveBlur,
  verifier: verifyBlur,
  assertProofInputs,
  assertContent,
  assertMessage,
};
export default json;
