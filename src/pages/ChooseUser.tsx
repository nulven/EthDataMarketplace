import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { Large } from '../components/text';
import eth from '../utils/ethAPI';

const Title = styled(Large)`
  margin-bottom: 10px;
`;

const ChooseUserWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 35%;
  margin-right: 35%;
  margin-top: 10%;
`;

const AddressWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: calc(100%);
  height: 50px;
  background-color: ${props => props.theme.color.white};
  border: ${props => `1px solid ${props.theme.color.grey30}`};
  margin-bottom: 10px;
  border-radius: 4px;
  padding: 10px;
  padding-left: 20px;
  cursor: pointer;
  align-items: center;
  :hover {
    background-color: ${props => props.theme.color.grey10};
  }
`;

const AddressText = styled(Large)`
  font-size: 25px;
`;

type AddressProps = {
  key: string;
  name: string;
  onClick: () => void;
};

const Address = (props: AddressProps) => {
  return (
    <AddressWrapper onClick={props.onClick} >
      <AddressText>{props.name.slice(0,6)}</AddressText>
    </AddressWrapper>
  );
};

const ChooseUser = (props) => {
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (props.signer) {
      props.signer.provider.listAccounts().then(setAddresses);
    }
  }, [props.signer]);

  const sendToTokens = () => {
    props.history.push('/tokens');
  };

  const selectAddress = (address: string) => () => {
    eth.setSigner(address);
    sendToTokens();
  };

  return (
    <ChooseUserWrapper>
      <Title>Select which address to use</Title>
      {addresses.map(address => <Address
        key={address}
        name={address}
        onClick={selectAddress(address)}
      />)}
    </ChooseUserWrapper>
  );
};


export default ChooseUser;
