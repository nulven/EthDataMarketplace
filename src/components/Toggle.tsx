import React  from 'react';
import styled from 'styled-components';


const ToggleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 60px;
  background-color: white;
  margin-bottom: 10px;
  margin-left: auto;
  margin-right: auto;
`;

type ElementDivProps = {
  active: boolean;
};

const ElementDiv = styled.div<ElementDivProps>`
  display: block;
  box-sizing: border-box;
  width: 100px;
  height: 100%;
  text-align: center;
  padding: 20px 0px;
  background-color: ${props => (props.active ?
    props.theme.color.secondary : props.theme.color.grey30)};
  :hover {
    background-color: ${props => props.theme.color.secondary};
  }
`;

type ToggleProps = {
  element: string;
  elements: object;
  setElement: (value) => void;
};

const Toggle = (props: ToggleProps) => {

  const setElement = (value) => () => {
    props.setElement(value);
  };

  return (
    <ToggleWrapper>
      {Object.keys(props.elements).map(key => (
        <ElementDiv
          key={key}
          onClick={setElement(props.elements[key])}
          active={props.element === props.elements[key]}
        >{key}</ElementDiv>
      ))}
    </ToggleWrapper>
  );
};

export default Toggle;
