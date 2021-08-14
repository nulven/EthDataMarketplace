import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import DarkForest from './content/DarkForest';
import Blur from './content/Blur';
import Hash from './content/Hash';

import {
  ContentProperties,
  Ciphertext,
} from '../types';
import {
  InputProps,
  ContentSkeleton,
} from '../types/content';


const content: Record<ContentProperties, ContentSkeleton> = {
  [ContentProperties.HASH]: Hash,
  [ContentProperties.BLUR]: Blur,
  [ContentProperties.DF]: DarkForest,
};

interface ContentInputProps extends InputProps {
  property: ContentProperties;
}

const ContentInput = (props: ContentInputProps) => {

  const PropertyInputElement = content[props.property].input;

  return (
    <>
      <PropertyInputElement
        preimage={props.preimage}
        setPreimage={props.setPreimage}
      />
    </>
  );
};

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  background-color: ${props => props.theme.color.grey10};
  margin-top: 10px;
  margin-bottom: 10px;
`;

type ContentProps = {
  property: string;
  content: {
    cipher: number[] | Ciphertext,
    property: number[] | BigInt,
  };
  secretKey: BigInt | null;
}

const Content = (props: ContentProps) => {
  const [message, setMessage] = useState(null);

  const {
    display,
    assertContent,
    assertMessage,
    decrypt,
  } = content[props.property];

  useEffect(() => {
    assertContent(props.content);
    if (props.secretKey) {
      const _message = decrypt(
        props.content.cipher,
        props.secretKey,
      );
      assertMessage(_message);
      setMessage(_message);
    }
  }, [props]);

  const PropertyElement = display;

  return (
    <ContentWrapper>
      <PropertyElement property={props.content.property} message={message} />
    </ContentWrapper>
  );
};

export {
  Content,
  ContentInput,
  content as ContentElements,
};
