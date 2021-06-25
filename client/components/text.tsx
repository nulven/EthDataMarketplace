import styled, { css } from 'styled-components';

const textWeights = {
  light: '\'wght\' 300',
  regular: '\'wght\' 400',
  medium: '\'wght\' 500',
  bold: '\'wght\' 700',
};

const textAlignment = {
  left: 'left',
  right: 'right',
  center: 'center',
  justify: 'justify',
  initial: 'initial',
  inherent: 'inherent',
};

const textStyles = {
  normal: 'normal',
  italic: 'italic',
};

const textTransformations = {
  uppercase: 'uppercase',
  lowercase: 'lowercase',
  capitalize: 'capitalize',
};

const Text = props => {
  const color = props.colored ?
    props.theme.color[props.colored] : props.theme.color.darkText;
  const weight = props.weight && textWeights[props.weight];
  const alignment = props.align && textAlignment[props.align];
  const transform = props.transform && textTransformations[props.transform];
  const style = props.styled && textStyles[props.styled];
  const font = props.theme.fontFamily;

  return css`
    color: ${color};
    font-variation-settings: ${weight};
    text-align: ${alignment};
    text-transform: ${transform};
    font-style: ${style};
    font-family: ${font};
  `;
};

export const Small = styled.div`
  ${Text};
  font-size: ${props => props.theme.text.small.size};
  line-height: ${props => props.theme.text.small.lineHeight};
`;

export const Medium = styled.div`
  ${Text};
  font-size: ${props => props.theme.text.medium.size};
  line-height: ${props => props.theme.text.medium.lineHeight};
`;

export const Large = styled.div`
  ${Text};
  font-size: ${props => props.theme.text.large.size};
  line-height: ${props => props.theme.text.large.lineHeight};
`;

export const Title = styled.div`
  height: 30px;
  font-size: 25px;
  padding: 5px;
`;
