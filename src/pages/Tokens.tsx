import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { Button } from '../components/Button';
import { Header } from '../components/text';

import PropertyToggle from '../app/PropertyToggle';
import { ContentElements } from './Content';

import config from '../../config';
import eth from '../utils/ethAPI';
import ipfs from '../utils/ipfs';
import { Parsers } from '../utils/parsers';
import {
  ContentProperties,
  Snark,
  Stark,
} from '../types';

const ZK = config.zk;

const TokensWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10%;
  margin-bottom: 10px;
  margin-left: 15%;
  margin-right: 15%;
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
  flex: 1;
  width: calc(100% - 100px);
  padding-left: 50px;
  padding-right: 50px;
  padding-top: 10px;
  align-items: center;
`;

type TokenProps = {
  url: string;
  property: ContentProperties;
  onClick: () => void;
};

const Token = (props: TokenProps) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    ipfs.getProof(props.url).then((proof: Snark | Stark) => {
      const { contentProperty } = Parsers[ZK][props.property](proof);
      setProperty(contentProperty);
      setLoading(false);
    });
  }, []);

  const PropertyListElement = ContentElements[props.property].list;

  return (
    <TokenWrapper onClick={props.onClick}>
      {!loading ?
        <PropertyListElement property={property} message={null} />
        : null}
    </TokenWrapper>
  );
};

const Tokens = (props) => {
  const [tokens, setTokens] = useState([]);
  const [property, setProperty] =
    useState<ContentProperties>(ContentProperties.HASH);

  useEffect(() => {
    if (props.signer) {
      eth.api.getContents().then(contents => {
        setTokens(contents);
      });
    }
  }, [props.signer, property]);

  const sendToToken = (contentId) => () => {
    props.history.push(`/tokens/${contentId}`);
  };

  const sendToNewToken = () => {
    props.history.push('/tokens/new');
  };

  return (
    <>
      <TokensWrapper>
        <Header>Discover Tokens</Header>
        <PropertyToggle property={property} setProperty={setProperty} />
        <Button style={{ width: '100%' }} onClick={sendToNewToken}>
          Post Token
        </Button>
      </TokensWrapper>
      <PostsWrapper>
        {tokens.filter(_ => _.property === property).map(_ => <Token
          key={_.url}
          url={_.url}
          property={_.property}
          onClick={sendToToken(_.id.toString())}
        />)}
      </PostsWrapper>
    </>
  );
};

export default Tokens;
