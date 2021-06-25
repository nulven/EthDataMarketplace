import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';

import { Button } from '../components/Button';
import { Large } from '../components/text';

import { ProfileContext } from './ContextProvider';


const Title = styled(Large)`
  margin-bottom: 10px;
  color: ${props => props.theme.color.white};
`;

const NFTsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 35%;
  margin-right: 35%;
  margin-top: 10%;
  margin-bottom: 10px;
`;

const NFTWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: calc(100%-20px);
  height: 50px;
  background-color: ${props => props.theme.color.white};
  margin-bottom: 10px;
  border-radius: 4px;
  padding: 10px;
  padding-left: 20px;
  cursor: pointer;
  align-items: center;
`;

const PostsWrapper = styled.div`
  width: 70%;
  padding-top: 10px;
  padding-left: 15%;
  padding-right: 15%;
  height: 100%;
`;

const NFTName = styled(Large)`
  font-size: 25px;
`;

type NFTProps = {
  name: string;
  onClick: () => void;
};

const NFT = (props: NFTProps) => {
  return (
    <NFTWrapper onClick={props.onClick} >
      <NFTName>{`r/${props.name}`}</NFTName>
    </NFTWrapper>
  );
};


const NFTs = (props) => {
  const [nfts, setNFTs] = useState([]);

  const profile = useContext(ProfileContext);

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = () => {
    // TODO
  };

  const sendToNFT = (name) => () => {
    props.history.push(`/nfts/${name}`);
  };

  const sendToNewNFT = () => {
    props.history.push({
      pathname: '/nfts/new',
      state: { publicKey: profile.publicKey },
    });
  };

  return (
    <>
      <NFTsWrapper>
        <Title>Discover NFTs</Title>
        <Button onClick={sendToNewNFT}>
          Post NFT
        </Button>
      </NFTsWrapper>
      <PostsWrapper>
        {nfts.map(subreddit => <NFT
          key={subreddit.name}
          onClick={sendToNFT(subreddit.name)}
          {...subreddit}
        />)}
      </PostsWrapper>
    </>
  );
};

export default NFTs;
