import React  from 'react';
import styled from 'styled-components';

import DateDiv from '../../components/Date';

import type { Upvote } from '../../types/skyAPI';


const UpvoteCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.color.white};
  border-radius: 5px;
  width: 90%;
  height: 50px;
  padding: 10px;
`;

const UpvoteCard = (props: Upvote) => {
  const date = new Date(props.timestamp);
  return (
    <UpvoteCardWrapper>
      <DateDiv timestamp={date} />
    </UpvoteCardWrapper>
  );
};

export default UpvoteCard;
