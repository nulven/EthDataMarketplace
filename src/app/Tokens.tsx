import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';

import { Button } from '../components/Button';
import { Header } from '../components/text';

import PropertyToggle from './PropertyToggle';
import { Image, Hash } from './Content';

import eth from '../utils/ethAPI';
import { getSnark } from '../utils/ipfs';
import {
  ContentProperties,
  TokenStates,
  Snark,
} from '../types'; 

const TokensWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10%;
  margin-bottom: 10px;
`;

const TokenWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: calc(452px - 22px);
  height: ${props => props.theme.spacing(6)};
  background-color: ${props => props.theme.color.white};
  border: ${props => `1px solid ${props.theme.color.grey30}`};
  margin-bottom: 10px;
  border-radius: 4px;
  padding: 11px;
  cursor: pointer;
  align-items: center;
  :hover {
    background-color: ${props => props.theme.color.grey10};
  }
`;

const PostsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(100% - 100px);
  padding-left: 50px;
  padding-right: 50px;
  padding-top: 10px;
  height: 100%;
  align-items: center;
`;

type TokenProps = {
  url: string;
  property: ContentProperties;
  onClick: () => void;
};

const Token = (props: TokenProps) => {
  const [blurredImage, setBlurredImage] = useState<number[]>([]);
  const [hash, setHash] = useState<bigint>(BigInt(0));

  useEffect(() => {
    getSnark(props.url).then((snark: Snark) => {
      if (props.property === ContentProperties.HASH) {
        setHash(BigInt(snark.publicSignals[3]));
      }
      else if (props.property === ContentProperties.BLUR) {
        const _blurredImage = snark.publicSignals.slice(1, 17).map(Number);
        setBlurredImage(_blurredImage);
      }
    });
  }, []);

  return (
    <TokenWrapper onClick={props.onClick}>
      {props.property === ContentProperties.HASH ?
        <Hash hash={hash} />
      : null}
      {props.property === ContentProperties.BLUR ?
        <Image bits={blurredImage}></Image>
      : null}
    </TokenWrapper>
  );
};

const Tokens = (props) => {
  const [tokens, setTokens] = useState([]);
  const [property, setProperty] = useState<ContentProperties>(ContentProperties.HASH);

  useEffect(() => {
    if (eth.signer) {
      eth.api.getUrlData().then(urls => {
        setTokens(urls);
      });
    }
  }, [props.signer, property]);

  const sendToToken = (hash) => () => {
    props.history.push(`/tokens/${hash}`);
  };

  const sendToNewToken = () => {
    props.history.push('/tokens/new');
  };

  return (
    <>
      <TokensWrapper>
        <Header>Discover Tokens</Header>
        <PropertyToggle property={property} setProperty={setProperty} />
        <Button onClick={sendToNewToken}>
          Post Token
        </Button>
      </TokensWrapper>
      <PostsWrapper>
        {tokens.filter(_ => _.property === property).map(_ => <Token
          key={_.url}
          url={_.url}
          property={_.property}
          onClick={sendToToken(_.url.toString())}
        />)}
      </PostsWrapper>
    </>
  );
};

export default Tokens;
