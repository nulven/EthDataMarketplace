import * as React from 'react';
import { selfTheme } from '../styles/theme';
import { ThemeProvider } from 'styled-components';

type Props = {
  theme?: Object,
  children?: any,
};

const OurThemeProvider = ({ theme = selfTheme, children }: Props) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

export default OurThemeProvider;
