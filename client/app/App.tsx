import React from 'react';
import { HashRouter, Switch } from 'react-router-dom';

import Page from './Page';
import NewNFT from './NewNFT';
import NFT from './NFT';
import NFTs from './NFTs';
import Home from './Home';

const App = () => {

  return (
    <HashRouter>
      <Switch>
        <Page path="/nfts/new" navbar={true} Subpage={NewNFT} />
        <Page path="/nfts/:id" navbar={true} Subpage={NFT} />
        <Page path="/nfts" navbar={true} Subpage={NFTs} />
        <Page path="/" navbar={true} Subpage={Home} />
      </Switch>
    </HashRouter>
  );
};

export default App;
