import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { FaAngleUp } from 'react-icons/fa';
import { Keypair, PrivKey, PubKey } from 'maci-domainobjs';

import { Button } from '../components/Button';
import DateDiv from '../components/Date';
import { Header, Large } from '../components/text';
import Spinner from '../components/Spinner';

import { Content, Image } from './Content';

import eth from '../utils/ethAPI';
import {
  stringToNum,
  stringToBits,
  getPreimage,
  decryptKeyCiphertext,
  decryptMessageCiphertext,
  encryptMessage,
  getCiphertext,
  getKey,
  blurImage,
} from '../utils/crypto';
import {
  proveEncryption,
  proveContract,
  verifyHash,
  verifyBlur,
} from '../utils/prover';
import { getFromIPFS, getSnark } from '../utils/ipfs';
import {
  ContentProperties,
  ContentVerifiers,
  TokenStates,
  Snark,
  EmptySnark,
  Ciphertext,
} from '../types'; 


const Body = styled.div`
  display: flex;
  flex-direction: column;
`;

const TokenWrapper = styled.div`
  margin-top: 10%;
  margin-left: 15%;
  margin-right: 15%;
  height: 80%;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const MintedTokensWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1 0;
  justify-content: space-between;
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
  [TokenStates.UNPURCHASED]: (url: string) => `You do not own this NFT`,
  [TokenStates.OWNED]: (url: string) => `You own this NFT`,
  [TokenStates.SELLER]: (url: string) => `You are the seller of this NFT`,
  [TokenStates.NULL]: (url: string) => `NFT is not found`,
};


const Token = (props) => {
  const url = props.match.params.url;
  const [property, setProperty] = useState<ContentProperties>(null);
  const [loading, setLoading] = useState<string>('');
  const [refresh, setRefresh] = useState(0);
  const [tokenState, setTokenState] = useState<TokenStates>(null);
  const [tokenIds, setTokenIds] = useState<BigInt[]>([]);
  const [snark, setSnark] = useState<Snark>(EmptySnark);
  const [key, setKey] = useState<BigInt>(BigInt(0));
  const [hashCiphertext, setHashCiphertext] = useState<Ciphertext>({ iv: BigInt(0), data: [] });
  const [blurredImage, setBlurredImage] = useState<number[]>([]);
  const [hash, setHash] = useState(BigInt(0));
  const [ownedToken, setOwnedToken] = useState(BigInt(0));

  useEffect(() => {
    setLoading('');
    if (props.signer) {
      eth.api.getTokens(url).then((_tokens: BigInt[]) => {
        setTokenIds(_tokens);
      });
      eth.api.getProperty(url).then(_property => {
        if (_property) {
          setProperty(_property);
          getSnark(url).then((snark: Snark) => {
            setSnark(snark);
            setState().then(state => {
              if (_property === ContentProperties.HASH) {
                const _hash = BigInt(snark.publicSignals[3]);
                setHash(_hash);
                if (state === TokenStates.SELLER) {
                  const _ciphertext = {
                    iv: BigInt(snark.publicSignals[1]),
                    data: [BigInt(snark.publicSignals[2])],
                  };
                  setHashCiphertext(_ciphertext);
                  const _key = getKey(url);
                  setKey(_key);
                }
              }
              else if (_property === ContentProperties.BLUR) {
                const _blurredImage = snark.publicSignals.slice(1, 17).map(Number);
                setBlurredImage(_blurredImage);
                if (state === TokenStates.SELLER) {
                  const _key = getKey(url);
                  setKey(_key);
                }
              }
              setLoading('');
            });
          });
        } else {
          setTokenState(TokenStates.NULL);
          setLoading('');
        }
      });
    }
  }, [props.signer, refresh])

  const setState = async () => {
    const res = await eth.api.checkCreator(url, eth.address);
    const res2 = await eth.api.checkOwnership(url, eth.address);
    let state;
    if (res) {
      state = TokenStates.SELLER;
    } else if (res2 !== BigInt(0)) {
      state = TokenStates.OWNED;
      setOwnedToken(res2);
    } else {
      state = TokenStates.UNPURCHASED;
    }
    setTokenState(state);
    return state;
  };

  const onPurchase = () => {
    setLoading('checking proof');
    const verifier = ContentVerifiers[property];
    verifier(snark).then(res => {
      if (res) {
        setLoading('purchasing token');
        eth.api.buyToken(url)
          .then(() => {
            setRefresh(refresh+1);
            setLoading('');
          })
          .catch(error => {
            setLoading('');
            alert(error.message);
          });
      } else {
        alert('Not a valid token');
        setLoading('');
      }
    }).catch(error => {
      alert(error.message);
      setLoading('');
    });
  };

  const retrieveMessage = () => {
    setLoading('getting ciphertext');
    eth.api.getCiphertext(ownedToken).then((ciphertext: BigInt[]) => {
      const _keyCiphertext: Ciphertext = {
        iv: ciphertext[0],
        data: [ciphertext[1]],
      };

      setLoading('get creator');
      eth.api.getCreator(url).then(address => {
        setLoading('get public key');
        eth.api.getPublicKey(address).then(_publicKey => {
          const [ciphertext, _key] = eth.retrieveCiphertext(_keyCiphertext, _publicKey, property, snark);
          setKey(_key);
          setCiphertext(ciphertext);
          setLoading('');
        }).catch(error => {
          setLoading('');
        });
      });
    }).catch(error => {
      setLoading('');
      alert(error.message);
    });
  };

  const setCiphertext = (ciphertext) => {
    if (property === ContentProperties.HASH) {
      setHashCiphertext(ciphertext);
    } else if (property === ContentProperties.BLUR) {
      setBlurredImage(ciphertext);
    }

  }

  const sendToTokens = () => {
    props.history.push('/tokens');
  };

  const redeemEth = (tokenId: BigInt) => async () => {
    setLoading('');
    const _privateKey = BigInt(eth.privateKey.toString());
    eth.api.getOwner(tokenId).then(publicKey => {
      setLoading('generating proof');

      const privKey = new PrivKey(eth.privateKey);
      const pubKey = new PubKey([publicKey[0], publicKey[1]]);
      const sharedKey = Keypair.genEcdhSharedKey(privKey, pubKey);

      const _key = getKey(url);

      proveContract(
        privKey,
        _key,
        pubKey,
      )
        .then(({ proof, publicSignals }) => {
          setLoading('sending proof to contract');
          eth.api.redeem(proof, publicSignals, tokenId)
            .then(() => {
              setLoading('');
            })
            .catch(error => {
              alert(error.message);
              setLoading('');
            });
        });
    });
  };

  return (
    <>
      {loading ?
        <Spinner loadingMessage={loading} />
        :
        <TokenWrapper>
          <Header>{StateHeaders[tokenState](url)}</Header>
          <Content
            secretKey={key}
            hash={{
              cipher: hashCiphertext,
              property: hash,
            }}
            image={{
              cipher: blurredImage,
              property: blurredImage,
            }}
          />
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
          {tokenState === TokenStates.SELLER && tokenIds.length > 0 ?
            <MintedTokensWrapper>
              {tokenIds.map(tokenId =>
                <MintedToken key={tokenId.toString()} id={tokenId} onClick={redeemEth(tokenId)} /> 
              )}
            </MintedTokensWrapper>
            : null}
        </TokenWrapper>
      }
    </>
  );
};

export default Token;
