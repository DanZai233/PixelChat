import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { User } from '../types';
import PixelAvatar from './PixelAvatar';

interface UserListProps {
  users: User[];
}

const Container = styled.div`
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #58A6FF;
  padding: 16px;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  color: #58A6FF;
  font-size: 12px;
  margin-bottom: 12px;
  text-align: center;
`;

const UserItem = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #161B22;
  gap: 8px;
  
  &:last-child {
    border-bottom: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Username = styled.span`
  color: #C9D1D9;
  font-size: 10px;
  margin-bottom: 2px;
`;

const Status = styled.span`
  color: #3FB950;
  font-size: 8px;
`;

const OnlineIndicator = styled.div`
  width: 8px;
  height: 8px;
  background: #3FB950;
  border-radius: 50%;
  margin-left: auto;
`;

const UserList: React.FC<UserListProps> = ({ users }) => {
  return (
    <Container>
      <Title>在线用户 ({users.length})</Title>
      {users.map((user) => (
        <UserItem
          key={user.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PixelAvatar avatar={user.avatar} size={20} />
          <UserInfo>
            <Username>{user.nickname}</Username>
            <Status>在线</Status>
          </UserInfo>
          <OnlineIndicator />
        </UserItem>
      ))}
    </Container>
  );
};

export default UserList;
