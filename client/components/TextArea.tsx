import React from 'react';
import styled from 'styled-components';

type Props = {
  id?: string,
  placeholder: string,
  handleEnter?: (string) => void,
  onChange: (value: string) => void,
  value: string,
  style?: Object,
};

const TextAreaWrapper = styled.textarea`
  font-family: 'Roboto Variable';
  padding: 8px;
  height: 40px;
  width: calc(100% - 16px);
  display: flex;
  border-radius: 5px;
  border-width: 1px;
  border-style: solid;
  border-color: ${props => props.theme.color.primary};
  font-variation-settings: 'wght' 500;
`;

function TextArea (props: Props) {
  const detectEnter = (e: any) => {
    if (e.key === 'Enter' && props.handleEnter) {
      props.handleEnter(e.target.value);
    }
  };

  return (
    <TextAreaWrapper
      id={props.id}
      style={props.style}
      onChange={e => props.onChange(e.target.value)}
      onKeyPress={detectEnter}
      placeholder={props.placeholder}
      value={props.value}
    />
  );
}

export default TextArea;
