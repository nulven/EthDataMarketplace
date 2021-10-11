import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import Modal from '../components/Modal';
import TextInput from '../components/TextInput';
import Toggle from '../components/Toggle';
import { Header } from '../components/text';
import ipfs from '../utils/ipfs';
import config from '../../config';


type IconProps = {
  connected: boolean;
}

const ConnectedIcon = styled.div<IconProps>`
  border-radius: ${props => props.theme.borderRadii.circle};
  width: 10px;
  height: 10px;
  background-color: ${props => props.connected ? 'green' : 'yellow'}; 
  border: 1px solid black;
  margin-right: auto;
`;

const IpfsLabel = styled.div`
  margin-right: auto;
`;

const IpfsIcon = styled.div`
  display: flex;
  border: ${props => `1px solid ${props.theme.color.grey30}`};
  height: ${props => props.theme.spacing(5)};
  padding: 0px 10px;
  align-items: center;
  border-radius: ${props => props.theme.borderRadii.curvy};
  :hover {
    cursor: pointer;
    background-color: ${props => props.theme.color.grey10};
  }
  flex: 1;
  margin-right: 10px;
  box-sizing: border-box;
`;

const ModalHeader = styled(Header)`
  margin-top: auto;
  margin-bottom: auto;
`;

enum Providers {
  HOST = 'host',
  INFURA = 'infura',
  LOCAL = 'local',
}

export default function Ipfs() {
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [provider, setProvider] = useState<Providers>(Providers.INFURA);
  const [host, setHost] = useState<string>(ipfs.host);
  const [protocol, setProtocol] = useState<string>(ipfs.protocol);
  const [infuraProjectId, setInfuraProjectId] =
    useState<string>(ipfs.infuraProjectId);
  const [infuraProjectSecret, setInfuraProjectSecret] =
    useState<string>(ipfs.infuraProjectSecret);
  const [connected, setConnected] = useState<boolean>(false);
  const [didMount, setDidMount] = useState<boolean>(false);

  useEffect(() => {
    switch (ipfs.host) {
      case 'host':
        setProvider(Providers.HOST);
        break;
      case 'infura':
        setProvider(Providers.INFURA);
        break;
      case 'localhost':
        setProvider(Providers.LOCAL);
        break;
    }
  }, []);

  useEffect(() => {
    ipfs.checkConnection().then(setConnected);
    setDidMount(true);
    return () => setDidMount(false);
  }, [provider]);

  const onShow = () => {
    setModalShow(true);
  };

  const onClose = () => {
    onEnter();
    setModalShow(false);
  };

  const onEnter = () => {
    ipfs.updateSettings(host, protocol, infuraProjectId, infuraProjectSecret);
  };

  const onSetProvider = (_provider: Providers) => {
    setProvider(_provider);
    switch(_provider) {
      case Providers.LOCAL:
        setHost('localhost');
        setProtocol('http');
        break;
      case Providers.INFURA:
        setHost('ipfs.infura.io');
        setProtocol('https');
        break;
      case Providers.HOST:
        setHost(config.ipfsHost);
        setProtocol('http');
        break;
    }
  };

  return (
    <>
      <IpfsIcon>
        <ConnectedIcon connected={connected} />
        <IpfsLabel>
          IPFS
        </IpfsLabel>
      </IpfsIcon>
      <Modal show={modalShow} onClose={onClose} buttonLabel={'Update'}>
        <ModalHeader>Change IPFS Settings</ModalHeader>
        <Toggle
          element={provider}
          elements={Providers}
          setElement={onSetProvider}
        />
        {provider === Providers.HOST ?
          null :
          <>
            <TextInput
              placeholder={'HOST'}
              handleEnter={onEnter}
              onChange={setHost}
              value={host}
            />
            <TextInput
              placeholder={'PROTOCOL'}
              handleEnter={onEnter}
              onChange={setProtocol}
              value={protocol}
            />
            <br />
            {provider === Providers.INFURA ?
              <>
                <TextInput
                  placeholder={'INFURA PROJECT ID'}
                  handleEnter={onEnter}
                  onChange={setInfuraProjectId}
                  value={infuraProjectId}
                />
                <TextInput
                  placeholder={'INFURA PROJECT SECRET'}
                  handleEnter={onEnter}
                  onChange={setInfuraProjectSecret}
                  value={infuraProjectSecret}
                />
              </>
              : null}
          </>
        }
      </Modal>
    </>
  );
}
