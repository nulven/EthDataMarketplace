import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PrivKey, PubKey } from 'maci-domainobjs';

import config from '../../config';
import { Button } from '../components/Button';
import { Header, Large } from '../components/text';
import Spinner from '../components/Spinner';
import { Content, ContentElements } from './Content';

import eth from '../utils/ethAPI';
import ipfs from '../utils/ipfs';
import { getKey, ZKFunctions } from '../utils/crypto';
import { Parsers } from '../utils/parsers';

import {
  TokenStates,
  Snark,
  EmptySnark,
  Stark,
  EmptyStark,
  Ciphertext,
  ContentProperties,
  ZKTypes,
} from '../types';

const TokenWrapper = styled.div`
  margin-top: 10%;
  margin-left: 15%;
  margin-right: 15%;
  height: 80%;
  display: flex;
  flex-direction: column;
`;

const MintedTokensWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 0;
  width: calc(100% - 20px);
  position: relative;
  background-color: ${props => props.theme.color.grey30};
  margin-bottom: 10px;
  padding: 10px;
  cursor: pointer;
  align-items: flex-start;
  overflow-y: scroll;
`;

const MintedTokenWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: calc(100% - 20px);
  height: 50px;
  background-color: ${props => props.theme.color.white};
  margin-bottom: 10px;
  border-radius: 4px;
  padding: 10px;
  cursor: pointer;
`;

const MintedTokenName = styled(Large)`
  font-size: 18px;
  flex: 2;
`;

type MintedTokenProps = {
  id: BigInt;
  onClick: () => void;
};

const RedeemButton = styled(Button)`
  flex: 1;
`;

const MintedToken = (props: MintedTokenProps) => {
  return (
    <MintedTokenWrapper>
      <MintedTokenName>{props.id.toString()}</MintedTokenName>
      <RedeemButton onClick={props.onClick}>
        Redeem ETH
      </RedeemButton>
    </MintedTokenWrapper>
  );
};

const StateHeaders = {
  [TokenStates.UNPURCHASED]: () => 'You do not own this NFT',
  [TokenStates.OWNED]: () => 'You own this NFT',
  [TokenStates.SELLER]:
    () => 'You are the seller of this NFT',
  [TokenStates.NULL]: () => 'NFT is not found',
};


const Token = (props) => {
  const contentId = props.match.params.id;
  const [content, setContent] = useState(null);
  const [property, setProperty] = useState<ContentProperties>(null);
  const [zk, setZK] = useState<ZKTypes>(null);
  const [loading, setLoading] = useState<string>('');
  const [tokenState, setTokenState] = useState<TokenStates>(null);
  const [tokens, setToken] = useState([]);
  const [proof, setProof] = useState<Snark | Stark>(null);
  const [key, setKey] = useState<BigInt>(BigInt(0));
  const [ciphertext, setCiphertext] = useState<Ciphertext | number[]>(null);
  const [contentProperty, setContentProperty] =
    useState<BigInt | number[]>(null);
  const [ownedToken, setOwnedToken] = useState(BigInt(0));

  useEffect(() => {
    setLoading('loading token');
    if (props.signer) {
      eth.api.getContent(contentId).then(_content => {
        setContent(_content);
        setZK(_content.zk);
        eth.api.getTokens(contentId).then((_tokens: BigInt[]) => {
          setToken(_tokens);
        });
        eth.api.getProperty(contentId).then(_property => {
          if (_property) {
            setProperty(_property);
            ipfs.getProof(_content.url, _content.zk).then(_proof => {
              setProof(_proof);
              setState().then(state => {
                if (state === TokenStates.SELLER) {
                  const _key = getKey(_content.url);
                  setKey(_key);
                }
                const parser = Parsers[_content.zk][_property];
                const { contentProperty, ciphertext } = parser(_proof);
                setContentProperty(contentProperty);
                setCiphertext(ciphertext);

                setLoading('');
              });
            });
          } else {
            setTokenState(TokenStates.NULL);
            setLoading('');
          }
        });
      });
    }
  }, [props.signer]);

  const setState = async () => {
    const res = await eth.api.checkCreator(contentId, eth.address);
    const res2 = await eth.api.checkOwnership(contentId, eth.address);
    let state;
    if (res) {
      state = TokenStates.SELLER;
    } else if (res2 !== BigInt(-1)) {
      state = TokenStates.OWNED;
      setOwnedToken(res2);
    } else {
      state = TokenStates.UNPURCHASED;
    }
    setTokenState(state);
    return state;
  };

  const onPurchase = async () => {
    try {
      setLoading('checking proof');
      const verifier = ContentElements[property].verifier;
      if (!verifier) {
        throw new Error(`${property} verifier not found`);
      }

      const verified = await verifier[zk](proof);
      if (!verified) {
        throw new Error('Not a valid token');
      }

      if (config.enableDarkForestCheck && property === ContentProperties.DF) {
        if ('publicSignals' in proof) {
          setLoading('checking hash');
          const hashCheck = await eth.api.checkHash(
            contentProperty,
            proof.publicSignals[proof.publicSignals.length-1],
          ).catch(console.log);
          if (!hashCheck) {
            throw new Error('Not a valid token');
          }
        }
      }

      setLoading('purchasing token');
      const purchase = await eth.api.buyToken(contentId, zk);
      if (!purchase) {
        throw new Error('Not a valid token');
      }

      setLoading('');
      alert('Purchase successful');
    } catch (error) {
      setLoading('');
      alert(error.message);
    }
  };

  const retrieveMessage = async () => {
    try {
      setLoading('getting ciphertext');
      const _keyCiphertext = await eth.api.getCiphertext(ownedToken);

      setLoading('get creator');
      const address = await eth.api.getCreator(contentId);

      setLoading('get public key');
      const publicKey = await eth.api.getPublicKey(address, zk);
      const [_ciphertext, _key] = await eth.retrieveCiphertext(
        _keyCiphertext,
        publicKey,
        property,
        proof,
        zk,
      );

      setKey(_key);
      setCiphertext(_ciphertext);

      setLoading('');
    } catch (error) {
      setLoading('');
      alert(error.message);
    }
  };

  const redeemEth = (tokenId: BigInt) => async () => {
    try {
      setLoading('generating proof');
      const publicKey = await eth.api.getOwner(tokenId, zk);

      const privKey = new PrivKey(eth.privateKey[zk]);
      const pubKey = new PubKey([publicKey[0], publicKey[1]]);
      const _key = getKey(content.url);

      const proof = await ZKFunctions[zk].provers.encryption([
        _key,
        privKey,
        pubKey,
      ]);

      setLoading('sending proof to contract');
      await eth.api.redeem(proof, tokenId, zk);

      setLoading('');
    } catch (error) {
      setLoading('');
      alert(error.message);
    }
  };

  return (
    <>
      {loading ?
        <Spinner loadingMessage={loading} />
        :
        <TokenWrapper>
          <Header>{StateHeaders[tokenState]()}</Header>
          {tokenState !== TokenStates.NULL && tokenState ?
            <Content
              secretKey={key}
              property={property}
              zk={zk}
              content={{
                cipher: ciphertext,
                property: contentProperty,
              }}
            />
            : null}
          {tokenState === TokenStates.UNPURCHASED ?
            <>
              <Button onClick={onPurchase}>
                Purchase Token
              </Button>
            </>
            : null}
          {tokenState === TokenStates.OWNED ?
            <>
              <Button onClick={retrieveMessage}>
                Redeem Ciphertext
              </Button>
            </>
            : null}
          {tokenState === TokenStates.SELLER && tokens.length > 0 ?
            <MintedTokensWrapper>
              {tokens.map(token =>
                <MintedToken
                  key={token.id.toString()}
                  id={token.id}
                  onClick={redeemEth(token.id)}
                />,
              )}
            </MintedTokensWrapper>
            : null}
        </TokenWrapper>
      }
    </>
  );
};

export default Token;
