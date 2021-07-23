import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';

import EventScroller from './EventScroller';
import PostCard from './PostCard';
import UpvoteCard from './UpvoteCard';
import CommentCard from './CommentCard';
import UserCard from './UserCard';
import SubredditCard from './SubredditCard';
import PendingVerification from '../PendingVerification';
import { get } from '../../utils/api';
import { getBucket } from '../../skyAPI';
import { ProfileContext } from '../ContextProvider';

import { Large } from '../../components/text';
import Spinner from '../../components/Spinner';

const Username = styled(Large)`
  margin-left: 5px;
  color: ${props => props.theme.color.white};
  font-weight: bold;
`;

const Title = styled(Large)`
  margin-bottom: 20px;
  color: ${props => props.theme.color.white};
  display: flex;
  flex-direction: row;
`;

const EventTitle = styled(Large)`
  margin-bottom: 10px;
  font-weight: bold;
  font-size: 24px;
  width: 100%;
  color: ${props => props.theme.color.white};
`;

const UserWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 10%;
  margin-right: 10%;
  margin-top: 10%;
`;

const User = (props) => {
  const username = props.match.params.username;
  const [user, setUser] = useState({});
  const [bucket, setBucket] = useState({});
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(null);

  const profile = useContext(ProfileContext);

  useEffect(() => {
    getUser();
    getUserBucket();
  }, []);

  const getUser = () => {
    setLoading(true);
    get(`/api/user/${username}`, {})
      .then((data) => {
        if (data.success) {
          if (data.verified) {
            setVerified(true);
            setUser(data.user);
          } else {
            setVerified(false);
          }

        } else {
          if (data.status === 400) {
            alert(data.message);
          }
        }
        setLoading(false);
      });
  };

  const getUserBucket = () => {
    getBucket(`${username}-bucket`, setBucket);
  };

  return (
    <UserWrapper>
      {loading || verified === null ?
        <Spinner />
        :
        <>
          {!verified ?
            <PendingVerification />
            :
            <>
              <Title>Welcome to the Decentralized Internet, {
                <Username>{username}</Username>
              }</Title>
              {user['public_key'] ?
                <>
                  <EventTitle>Posts</EventTitle>
                  <EventScroller
                    events={bucket['posts'] ? bucket['posts'] : []}
                    card={PostCard}
                  />
                  <EventTitle>Comments</EventTitle>
                  <EventScroller
                    events={bucket['comments'] ? bucket['comments'] : []}
                    card={CommentCard}
                  />
                  <EventTitle>Upvotes</EventTitle>
                  <EventScroller
                    events={bucket['upvotes'] ? bucket['upvotes'] : []}
                    card={UpvoteCard}
                  />
                  <EventTitle>Known Users</EventTitle>
                  <EventScroller
                    events={bucket['users'] ? bucket['users'] : []}
                    card={UserCard}
                  />
                  <EventTitle>Known Subreddits</EventTitle>
                  <EventScroller
                    events={bucket['subreddit'] ? bucket['subreddit'] : []}
                    card={SubredditCard}
                  />
                </>
                :
                <Title>Pending Verification</Title>
              }
            </>
          }
        </>
      }
    </UserWrapper>
  );
};

export default User;
