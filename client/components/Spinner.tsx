import React from 'react';
import styled from 'styled-components';
import Loader from 'react-loader-spinner';


const SpinnerWrapper = styled.div`
  display: flex;
  width: 10%;
  height: 10%;
  margin-left: 45%;
  margin-right: 45%;
  margin-top: 20%;
  margin-bottom: 70%;
`;

const Spinner = () => {
  return (
    <SpinnerWrapper>
      <Loader type="Oval" />
    </SpinnerWrapper>
  );
};


export default Spinner;
