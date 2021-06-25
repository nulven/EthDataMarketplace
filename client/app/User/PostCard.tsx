import React from 'react';
import styled from 'styled-components';

import DateDiv from '../../components/Date';

import type { Post } from '../../types/skyAPI';


const PostCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.color.white};
  border-radius: 5px;
  width: 90%;
  height: 50px;
  padding: 10px;
  margin-bottom: 10px;
`;

const PostCard = (props: Post) => {
  const date = new Date(props.timestamp);
  return (
    <PostCardWrapper>
      {props.text}
      <DateDiv timestamp={date} />
    </PostCardWrapper>
  );
};

export default PostCard;
