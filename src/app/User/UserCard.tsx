import React from 'react';
import styled from 'styled-components';

import type { KnownUser } from '../../types/skyAPI';


const UserCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.color.white};
  border-radius: 5px;
  width: 90%;
  height: 50px;
  padding: 10px;
`;

const UserCard = (props: KnownUser) => {

  return (
    <UserCardWrapper>
    </UserCardWrapper>
  );
};

export default UserCard;
