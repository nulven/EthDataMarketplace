import React, { useEffect } from 'react';
import { Route } from 'react-router-dom';

import NavigationBar from './NavigationBar';
import OurThemeProvider from './OurThemeProvider';
import ProfileProvider from './ContextProvider';
import { selfTheme } from '../styles/theme';

interface Props {
  path: string;
  Subpage: any;
  navbar: boolean;
}

export default function Page(props: Props) {
  const { path, Subpage, navbar } = props;

  document.body.style.backgroundColor = selfTheme.color.dark;

  useEffect(() => {
    if (document) {
      const title = 'Clef';
      document.title = title;
    }
  }, [path]);

  return (
    <Route
      exact path={path}
      render={(props: any) => (
        <OurThemeProvider>
          <ProfileProvider profile={{}}>
            {navbar ?
              <NavigationBar activeTab={path} history={props.history} />
              : null}
            <Subpage {...props} />
          </ProfileProvider>
        </OurThemeProvider>
      )}
    />
  );
}
