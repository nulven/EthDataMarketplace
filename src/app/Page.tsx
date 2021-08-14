import React, { useEffect } from 'react';
import { Route } from 'react-router-dom';

import NavigationBar from './NavigationBar';
import OurThemeProvider from './OurThemeProvider';
import { selfTheme } from '../styles/theme';

interface Props {
  path: string;
  Subpage: any;
  navbar: boolean;
  signer: any;
}

export default function Page(props: Props) {
  const { path, Subpage, navbar } = props;

  document.body.style.backgroundColor = selfTheme.color.light;

  useEffect(() => {
    if (document) {
      const title = 'Data Marketplace';
      document.title = title;
    }
  }, [path]);

  return (
    <Route
      exact path={path}
      render={(_props: any) => (
        <OurThemeProvider>
          {navbar ?
            <NavigationBar
              activeTab={path}
              history={_props.history}
              signer={props.signer}
            />
            : null}
          <Subpage {..._props} signer={props.signer} />
        </OurThemeProvider>
      )}
    />
  );
}
