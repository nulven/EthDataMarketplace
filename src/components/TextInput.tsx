import React from 'react';
import styled from 'styled-components';

type Props = {
  id?: string,
  placeholder: string,
  handleEnter?: (string) => void,
  onChange: (value: string) => void,
  value: string,
  style?: Object,
  label?: string,
};

const Label = styled.div`
  display: flex;
  flex: 1;
  min-width: 40px;
  background-color: ${props => props.theme.color.grey30};
  align-items: center;
  justify-content: center;
  border-radius: 5px 0px 0px 5px;
  border-width: 1px 0px 1px 1px;
  border-style: solid;
  border-color: ${props => props.theme.color.primary};
`;

const TextInputWrapper = styled.input`
  font-family: 'Roboto Variable';
  padding: 0 8px;
  height: 40px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  border-width: 1px;
  border-style: solid;
  border-color: ${props => props.theme.color.primary};
  font-variation-settings: 'wght' 500;
`;

const InputDivWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 40px;
  width: 100%;
  margin-bottom: 10px;
`;

const TextInputWithLabelWrapper = styled.input`
  font-family: 'Roboto Variable';
  padding: 0 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0px 5px 5px 0px;
  border-width: 1px 1px 1px 0px;
  border-style: solid;
  border-color: ${props => props.theme.color.primary};
  font-variation-settings: 'wght' 500;
  flex: 5;
`;


function TextInput (props: Props) {
  const detectEnter = (e: any) => {
    if (e.key === 'Enter' && props.handleEnter) {
      props.handleEnter(e.target.value);
    }
  };

  return (
    <>
      {props.label ?
        <InputDivWrapper>
          <Label>{props.label}</Label>
          <TextInputWithLabelWrapper
            id={props.id}
            style={props.style}
            onChange={e => props.onChange(e.target.value)}
            onKeyPress={detectEnter}
            placeholder={props.placeholder}
            value={props.value}
          />
        </InputDivWrapper>
        :
        <InputDivWrapper>
          <TextInputWrapper
            id={props.id}
            style={props.style}
            onChange={e => props.onChange(e.target.value)}
            onKeyPress={detectEnter}
            placeholder={props.placeholder}
            value={props.value}
          />
        </InputDivWrapper>
      }
    </>
  );
}

export default TextInput;
