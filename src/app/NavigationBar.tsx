import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

import { Button } from '../components/Button';
import { Large } from '../components/text';
import Ipfs from './Ipfs';
import { selfTheme as theme } from '../styles/theme';


interface NavBarElementProps {
  active: boolean;
}

const color = theme.color.darkText;
const NavBarElementWrapper = styled.div<NavBarElementProps>`
  border-bottom: ${props => (props.active ?
    `3px solid ${color}` : 'none')};
  :hover {
    border-bottom: ${() => `3px solid ${color}`};
    div {
      color: ${color};
    }
  }
  display: flex;
  align-items: center;
  div {
    color: ${props => (props.active ? color : 'default')};
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
        <Large>{props.title}</Large>
      </Link>
    </NavBarElementWrapper>
  );
};

const NavigationBarWrapper = styled.div`
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  flex-direction: row;
  background-color: ${props => props.theme.color.white};
  border-bottom: ${props => `1px solid ${props.theme.color.grey30}`};
  a {
    text-decoration: none;
  }
  position: fixed;
`;

const ElementsWrapper = styled.div`
  flex: 2;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
`;

const SidebarWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  flex: 1;
  align-items: center;
`;

const LogoutButton = styled(Button)`
  display: flex;
  margin-right: 10px;
  padding: 10px;
  flex: 1;
`;

const Title = styled(Large)`
  margin-right: 20px;
  color: ${color};
`;

type NavigationBarProps = {
  activeTab: string;
  history: any;
  signer: any;
}

const NavigationBar = (props: NavigationBarProps) => {
  const [address, setAddress] = useState('');
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (props.signer) {
      props.signer.getAddress().then(add => {
        setAddress(add);
      });
      props.signer.provider.listAccounts().then(setAddresses);
    }
  }, [props.signer]);

  const sendToChooseUser = () => {
    props.history.push('/choose-user');
  };

  return (
    <NavigationBarWrapper>
      <ElementsWrapper>
        <NavigationBarElement
          path={'/tokens'}
          title='Discovery'
          activeTab={props.activeTab}
        />
      </ElementsWrapper>
      {addresses.length > 0 ?
        <LogoutButton onClick={sendToChooseUser}>
          Choose Address
        </LogoutButton>
        : null}
      {address ?
        <SidebarWrapper>
          <Title>{address.slice(0,6)}</Title>
          <Ipfs />
          <LogoutButton onClick={() => {}}>
            Logout
          </LogoutButton>
        </SidebarWrapper>
        :
        <SidebarWrapper>
          <Ipfs />
          <LogoutButton onClick={() => {}}>
            Login
          </LogoutButton>
        </SidebarWrapper>
      }
    </NavigationBarWrapper>
  );
};

export default NavigationBar;
