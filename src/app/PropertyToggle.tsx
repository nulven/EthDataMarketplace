import React  from 'react';
import styled from 'styled-components';

import Toggle from '../components/Toggle';
import { ContentProperties } from '../types';

type PropertyToggleProps = {
  property: string;
  setProperty: (value: ContentProperties) => void;
};

const PropertyToggle = (props: PropertyToggleProps) => {

  return (
    <Toggle
      element={props.property}
      elements={ContentProperties}
      setElement={props.setProperty}
    />
  );
};

export default PropertyToggle;
