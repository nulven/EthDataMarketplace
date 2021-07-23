import React from 'react';
import styled from 'styled-components';

import type { Comment } from '../../types/skyAPI';


const CommentCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.color.white};
  border-radius: 5px;
  width: 90%;
  height: 50px;
  padding: 10px;
`;

const CommentCard = (props: Comment) => {

  return (
    <CommentCardWrapper>
    </CommentCardWrapper>
  );
};

export default CommentCard;

