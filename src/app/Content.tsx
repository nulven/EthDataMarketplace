import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import TextArea from '../components/TextArea';
import { Large } from '../components/text';

import { blurImage, decryptMessageCiphertext } from '../utils/crypto';
import {
  ContentProperties,
  Ciphertext,
} from '../types';


const inputStyle = {
  display: 'relative',
  marginBottom: '10px',
  width: 'calc(100%-16px-2px)',
  height: '60%',
  fontSize: '20px',
  padding: '16px',
};

type ContentInputProps = {
  property: ContentProperties;
  preimage: string;
  setPreimage: (value: string) => void;
}

const ContentInput = (props) => {

  useEffect(() => {
    if (props.property === ContentProperties.BLUR) {
      props.setPreimage('0000000000000000');
    }
  }, [props.property]);

  useEffect(() => {
  }, [props.preimage]);
  
  const onChange = (index: number) => () => {
    let preimageArray = props.preimage.split('').map(Number);
    preimageArray[index] = (preimageArray[index] + 1) % 2;
    const newPreimage = preimageArray.join('');
    props.setPreimage(newPreimage);
  };

  return (
    <>
      {props.property === ContentProperties.HASH ?
        <TextArea
          style={inputStyle}
          onChange={props.setPreimage}
          value={props.preimage}
          placeholder={''}
        />
      : null}
      {props.property === ContentProperties.BLUR ?
        <ImageWrapper>
          {props.preimage.split('').map((bit, index) => {
            return (
              <Pixel bit={parseInt(bit)} key={index} onClick={onChange(index)} />
            );
          })}
        </ImageWrapper>
      : null}
    </>
  );
}

const HashWrapper = styled.div`
  padding: 10px;
  width: 100%;
`;

const HashText = styled(Large)`
  font-size: 18px;
`;

type HashProps = {
  hash: BigInt;
  message: string;
}

const Hash = (props: HashProps) => {

  const hashString = props.hash.toString();
  const hashArray = hashString.split('');

  const halfSize = 12;
  const hashFirstHalf = hashArray.slice(0, halfSize).join('');
  const hashLastHalf = hashArray.slice(hashArray.length - halfSize).join('');
  const display = props.message ? props.message : `${hashFirstHalf}...${hashLastHalf}`;

  return (
    <HashWrapper>
      <HashText>{display}</HashText>
    </HashWrapper>
  );
}

type PixelProps = {
  bit: number;
}

const Pixel = styled.div<PixelProps>`
  display: flex;
  width: 100%;
  height: calc(100% + 1px);
  background-color: ${props => (props.bit === 0 ?
    'black' : 'white')};
`;

const ImageWrapper1 = styled.div`
  justify-content: space-between;
  border: 1px solid black;
  display: flex;
  flex-direction: row;
  height: 100%;
  width: calc(100% - 1px);
  align-items: center;
  box-sizing: border-box;
`;

type ImageProps = {
  bits: number[];
}

const Image = (props: ImageProps) => {
  return (
    <ImageWrapper1>
      {props.bits.map((bit, index) =>
        <Pixel bit={bit} key={index} />
      )}
    </ImageWrapper1>
  );
}

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: calc(100% - 20px);
  padding: 10px;
  background-color: ${props => props.theme.color.grey10};
  margin-top: 10px
`;

const ImageWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 100px;
  width: 100%;
  border: 1px solid black;
`;

type ContentProps = {
  secretKey: BigInt | null;
  image: {
    cipher: number[] | null,
    property: number[] | null,
  };
  hash: {
    cipher: Ciphertext | null,
    property: BigInt | null,
  };
}

const Content = (props: ContentProps) => {
  const [message, setMessage] = useState<string>('');
  const [image, setImage] = useState<number[]>([])

  useEffect(() => {
    if (props.hash.property) {
      if (props.secretKey) {
        const _message = decryptMessageCiphertext(props.hash.cipher, props.secretKey);
        setMessage(_message);
      }
    } else if (props.image.property.length > 0) { 
      if (props.secretKey) {
        const _image = blurImage(props.image.cipher, props.secretKey);
        setImage(_image);
      } else {
        setImage(props.image.property);
      }
    }
  }, [props]);

  return (
    <ContentWrapper>
      {props.hash.property ? (
        <Hash hash={props.hash.property} message={message} />
      ) : null}
      {props.image.property.length > 0 ? (
        <ImageWrapper>
          {image.map((bit, index) => {
            return (
              <Pixel bit={bit} key={index} />
            );
          })}
        </ImageWrapper>
      ) : null}
    </ContentWrapper>
  );
}

export {
  Hash,
  Image,
  Content,
  ContentInput,
}
