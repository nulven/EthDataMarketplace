import React, { useState, useContext } from 'react';
import styled from 'styled-components';

import { Button } from '../components/Button';
import TextArea from '../components/TextArea';
import { Large } from '../components/text';
import { ProfileContext } from './ContextProvider';

import Spinner from '../components/Spinner';


const Title = styled(Large)`
  margin-bottom: 10px;
  color: ${props => props.theme.color.white};
`;

const NewNFTWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 20%;
  margin-right: 20%;
  margin-top: 10%;
  height: 100%;
`;

const inputStyle = {
  display: 'relative',
  marginBottom: '10px',
  width: 'calc(100%-16px-2px)',
  height: '60%',
  fontSize: '20px',
  padding: '16px',
};

const NewNFT = (props) => {
  const subreddit = props.location.state ?
    props.location.state.subreddit : 'test';
  const [hash, setHash] = useState('');
  const [loading, setLoading] = useState(false);

  const profile = useContext(ProfileContext);

  const onChange = (setter) => (value) => {
    setter(value);
  };

  const onSell = () => {
    // TODO
  };

  return (
    <>
      {loading ?
        <Spinner />
        :
        <NewNFTWrapper>
          <Title>Sell your NFT</Title>
          <TextArea
            style={inputStyle}
            onChange={onChange(setHash)}
            value={hash}
            placeholder={''}
          />
          <Button onClick={onSell}>
            Submit NFT
          </Button>
        </NewNFTWrapper>
      }
    </>
  );
};

export default NewNFT;
