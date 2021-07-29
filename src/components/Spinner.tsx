import React from 'react';
import styled from 'styled-components';
import Loader from 'react-loader-spinner';
import { Large } from '../components/text';


const SpinnerWrapper = styled.div`
  display: flex;
  width: 40%;
  flex: 1;
  margin-left: 30%;
  margin-right: 30%;
  margin-top: 20%;
  flex-direction: column;
  align-items: center;
`;

type SpinnerProps = {
  loadingMessage: string;
}

const Title = styled(Large)`
  margin-top: 30px;
`;

const Spinner = (props: SpinnerProps) => {
  return (
    <SpinnerWrapper>
      <Loader type="Oval" />
      <Title>{props.loadingMessage}</Title>
    </SpinnerWrapper>
  );
};


export default Spinner;
