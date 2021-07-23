import React  from 'react';
import styled from 'styled-components';
import { ContentProperties } from '../types';


const PropertyToggleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 200px;
  height: 10%;
  background-color: white;
  margin-bottom: 10px;
`;

type PropertyDivProps = {
  active: boolean;
};

const PropertyDiv = styled.div<PropertyDivProps>`
  display: block;
  width: 50%;
  height: calc(100% - 40px);
  text-align: center;
  padding: 20px 0px;
  background-color: ${props => (props.active ?
    props.theme.color.secondary : props.theme.color.grey30)};
  :hover {
    background-color: ${props => props.theme.color.secondary};
  }
`;

type PropertyToggleProps = {
  property: string;
  setProperty: (value: ContentProperties) => void;
};

const PropertyToggle = (props: PropertyToggleProps) => {

  const setProperty = (value: ContentProperties) => () => {
    props.setProperty(value);
  };

  return (
    <PropertyToggleWrapper>
      <PropertyDiv
        onClick={setProperty(ContentProperties.HASH)}
        active={props.property === ContentProperties.HASH}
      >Hash</PropertyDiv>
      <PropertyDiv
        onClick={setProperty(ContentProperties.BLUR)}
        active={props.property === ContentProperties.BLUR}
      >Blur</PropertyDiv>
    </PropertyToggleWrapper>
  );
};

export default PropertyToggle;
