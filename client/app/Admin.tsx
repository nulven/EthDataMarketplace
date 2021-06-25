import React from 'react';
import styled from 'styled-components';

import { Button } from '../components/Button';
import { post } from '../utils/api';


const AdminWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 35%;
  margin-right: 35%;
  margin-top: 10%;
`;

const Admin = () => {
  const crawler = () => {
    post('/admin/crawler', {})
      .then((data) => {
        if (data.success) {
          console.log('success');
        } else {
          if (data.status === 400) {
            console.log(data.message);
          }
        }
      });
  };

  const verifyUsers = () => {
    post('/admin/verify-users', {})
      .then((data) => {
        if (data.success) {
          console.log('success');
        } else {
          if (data.status === 400) {
            console.log(data.message);
          }
        }
      });
  };

  const verifySubreddits = () => {
    post('/admin/verify-subreddits', {})
      .then((data) => {
        if (data.success) {
          console.log('success');
        } else {
          if (data.status === 400) {
            console.log(data.message);
          }
        }
      });
  };

  return (
    <AdminWrapper>
      <Button onClick={crawler}>
        Crawler
      </Button>
      <Button onClick={verifyUsers}>
        Verify Users
      </Button>
      <Button onClick={verifySubreddits}>
        Verify Subreddits
      </Button>
    </AdminWrapper>
  );
};

export default Admin;
