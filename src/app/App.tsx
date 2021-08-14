import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Switch } from 'react-router-dom';
import Web3Modal from 'web3modal';
import WalletLink from 'walletlink';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { providers } from 'ethers';

import config from '../../config';

import Page from './Page';

import NewToken from '../pages/NewToken';
import Token from '../pages/Token';
import Tokens from '../pages/Tokens';
import ChooseUser from '../pages/ChooseUser';

import eth from '../utils/ethAPI';

const INFURA_ID = '';
const walletLink = new WalletLink({
  appName: 'coinbase',
});
const chain = 'ropsten';
const walletLinkProvider = walletLink.makeWeb3Provider(
  `https://${chain}.infura.io/v3/${INFURA_ID}`,
  1,
);
const web3Modal = new Web3Modal({
  network: chain,
  cacheProvider: true, // optional
  theme: 'light', // optional. Change to "dark" for a dark theme.
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        bridge: 'https://polygon.bridge.walletconnect.org',
        infuraId: INFURA_ID,
        rpc: {
          1:'https://${chain}.infura.io/v3/${INFURA_ID}', // mainnet // For more WalletConnect providers: https://docs.walletconnect.org/quick-start/dapps/web3-provider#required
        },
      },
    },
    /*torus: {
      package: Torus,
    },*/
    'custom-walletlink': {
      display: {
        logo: 'https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0',
        name: 'Coinbase',
        description: 'Connect to Coinbase Wallet (not Coinbase App)',
      },
      package: walletLinkProvider,
      connector: async (provider) => {
        await provider.enable();
        return provider;
      },
    },
  },
});

const App = () => {
  const [signer, setSigner] = useState();

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (eth.provider &&
        eth.provider['provider'] &&
        typeof eth.provider['provider'].disconnect == 'function') {
      await eth.provider['provider'].disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    const injectedProvider = new providers.Web3Provider(provider);
    eth.setProvider(injectedProvider, setSigner);

    provider.on('chainChanged', chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
    });

    provider.on('accountsChanged', () => {
      console.log('account changed!');
      eth.setProvider(injectedProvider, setSigner);
    });

    provider.on('disconnect', (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
  }, []);

  useEffect(() => {
    const { env } = config;
    let provider;
    if (env === 'production') {
      loadWeb3Modal();
    } else {
      const network_url = 'http://localhost:8545';
      provider = new providers.JsonRpcProvider(network_url);
      eth.setProvider(provider, setSigner);
    }
  }, []);

  return (
    <HashRouter>
      <Switch>
        <Page
          path="/tokens/new"
          navbar={true}
          Subpage={NewToken}
          signer={signer}
        />
        <Page
          path="/tokens/:url"
          navbar={true}
          Subpage={Token}
          signer={signer}
        />
        <Page
          path="/tokens"
          navbar={true}
          Subpage={Tokens}
          signer={signer}
        />
        <Page
          path="/choose-user"
          navbar={true}
          Subpage={ChooseUser}
          signer={signer}
        />
        <Page
          path="/"
          navbar={true}
          Subpage={Tokens}
          signer={signer}
        />
      </Switch>
    </HashRouter>
  );
};

export default App;
