import styled from 'styled-components';

export const Button = styled.button`
  font-family: ${props => props.theme.fontFamily};
  height: 40px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  border-radius: 5px;
  border-width: 1px;
  border-style: solid;
  font-variation-settings: 'wght' 500;
  cursor: pointer;
  background-color: ${props => props.theme.color.primary};
`;
