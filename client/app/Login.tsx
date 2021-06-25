import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';

import { login } from '../skyAPI';

import { Button } from '../components/Button';
import { Large } from '../components/text';

import { ProfileContext } from './ContextProvider';
import { emitter } from '../skyAPI';


const Title = styled(Large)`
  margin-bottom: 10px;
  color: ${props => props.theme.color.white};
`;

const LoginWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 35%;
  margin-right: 35%;
  margin-top: 10%;
`;


const Login = (props) => {
  const profile = useContext(ProfileContext);

  useEffect(() => {
    if (profile.username) {
      sendToSubreddits();
    }
  }, [profile]);

  const sendToChooseUser = () => {
    props.history.push('/choose-user');
  };

  const sendToSubreddits = () => {
    props.history.push('/subreddit');
  };

  const onLogin = () => {
    login();
    emitter.on('login', () => {
      sendToChooseUser();
    });
    emitter.on('failed', () => {
      alert('Sia Error'); }); };

  return (
    <LoginWrapper>
      <Title>Welcome to the Decentralized Internet</Title>
      <Button onClick={onLogin}>
        Login to SkyID
      </Button>
    </LoginWrapper>
  );
};

export default Login;
