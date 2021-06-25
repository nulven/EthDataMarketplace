import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { FaAngleUp } from 'react-icons/fa';

import { get } from '../utils/api';
import { Button } from '../components/Button';
import DateDiv from '../components/Date';
import { Large, Small } from '../components/text';
import Spinner from '../components/Spinner';

import { ProfileContext } from './ContextProvider';


const Title = styled(Large)`
  margin-bottom: 10px;
  color: ${props => props.theme.color.white};
`;

const NFTWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 35%;
  margin-right: 35%;
  margin-top: 10%;
  margin-bottom: 10px;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

const NFT = (props) => {
  const name = props.match.params.name;
  const [nft, setNFT] = useState({});
  const [loading, setLoading] = useState(false);

  const profile = useContext(ProfileContext);

  useEffect(() => {
    loadNFT();
  }, []);

  const loadNFT = () => {
    // TODO
  };

  // TODO
  const unpurchasedState = ;
  const ownedState = ;
  const sellerState = nft.publicKey === profile.publicKey;

  return (
    <>
      {loading ?
        <Spinner />
        :
        <>
          {unpurchasedState ?
            <Title>Unpurchased</Title>
            : null}
          {ownedState ?
            <Title>Owned</Title>
            : null}
          {sellerState ?
            <Title>Seller</Title>
            : null}
        </>
      }
    </>
  );
};

export default NFT;
