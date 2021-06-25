import React, { useEffect, useContext } from 'react';
import styled from 'styled-components';

import { Large } from '../components/text';

import { ProfileContext } from './ContextProvider';


const Title = styled(Large)`
  margin-bottom: 10px;
  color: ${props => props.theme.color.white};
`;

const HomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 35%;
  margin-right: 35%;
  margin-top: 10%;
`;

const Home = (props) => {
  const profile = useContext(ProfileContext);

  useEffect(() => {
    if (profile.username) {
      sendToSubreddits();
    } else {
      sendToLogin();
    }
  }, [profile]);

  const sendToLogin = () => {
    props.history.push('/login');
  };

  const sendToSubreddits = () => {
    props.history.push('/subreddit');
  };

  return (
    <HomeWrapper>
      <Title>Welcome to the Decentralized Internet</Title>
    </HomeWrapper>
  );
};

export default Home;
