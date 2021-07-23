import React from 'react';
import styled from 'styled-components';

import type { KnownSubreddit } from '../../types/skyAPI';


const SubredditCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.color.white};
  border-radius: 5px;
  width: 90%;
  height: 50px;
  padding: 10px;
`;

const SubredditCard = (props: KnownSubreddit) => {

  return (
    <SubredditCardWrapper>
    </SubredditCardWrapper>
  );
};

export default SubredditCard;
