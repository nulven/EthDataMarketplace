import React, { useContext } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

import { Medium } from '../components/text';

import { ProfileContext } from './ContextProvider';
import {
  emitter,
  login,
  logout,
} from '../skyAPI';


interface NavBarElementProps {
  active: boolean;
}

const NavBarElementWrapper = styled.div<NavBarElementProps>`
  border-bottom: ${props => (props.active ?
    `3px solid ${props.theme.color.blue}` : 'none')};
  padding-top: ${props => (props.theme.spacing(2))};
  padding-bottom: ${props => (props.theme.spacing(2))};
  div {
    color: ${props => (props.active ? props.theme.color.blue : 'default')};
    :hover {
      color: ${props => (props.theme.color.blue)};
    }
  }
`;

type NavigationBarElementProps = {
  path: string;
  title: string;
  icon?: string;
  activeTab: string;
};

const NavigationBarElement = (props: NavigationBarElementProps) => {
  return (
    <NavBarElementWrapper active={props.activeTab === props.path}>
      <Link to={props.path}>
        <Medium>{props.title}</Medium>
      </Link>
    </NavBarElementWrapper>
  );
};

const NavigationBarWrapper = styled.div`
  width: 100%;
  height: 50px;
  display: flex;
  flex-direction: row;
  border-bottom: ${props => (props.theme.border)};
  background-color: ${props => props.theme.color.grey50};

  a {
    text-decoration: none;
  }
`;

const ElementsWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
`;

const LogoutButton = styled(Button)`
  display: flex;
  width: 10%;
  margin-top: 5px;
  margin-right: 10px;
`;

type NavigationBarProps = {
  activeTab: string;
  history: any;
}

const NavigationBar = (props: NavigationBarProps) => {
  const profile = useContext(ProfileContext);

  const onLogout = () => {
    profile.setPrivateKey('');
    props.history.push('/');
  };

  const onLogin = () => {
    const privateKey = prompt('Please enter your private key');
    profile.setPrivateKey(privateKey);
  };

  return (
    <NavigationBarWrapper>
      <ElementsWrapper>
        <NavigationBarElement
          path={'/nfts'}
          title='Discovery'
          activeTab={props.activeTab}
        />
        <NavigationBarElement
          path='/subreddit'
          title='Subreddits'
          activeTab={props.activeTab}
        />
      </ElementsWrapper>
      {profile.publicKey ?
        <>
          <LogoutButton onClick={onLogout}>
            Logout
          </LogoutButton>
        </>
        :
        <LogoutButton onClick={onLogin}>
          Login
        </LogoutButton>
      }
    </NavigationBarWrapper>
  );
};

export default NavigationBar;
