import { Avatar, Descriptions } from 'antd';
import styled from 'styled-components';
import { Box, Title } from '../../components/Box';
import { ContentWrapper } from '../../components/ContentWrapper';
import { useAuth } from '../../hooks/useAuth';
import randomColor from 'randomcolor';
import { dayjs } from '../../utils/dayjs';
import React from 'react';

export const Profile = () => {
  const { user } = useAuth();

  return (
    <ContentWrapper>
      {user && (
        <Box>
          <Title>Profile</Title>
          <UserInfo>
            <AvatarWrapper>
              <Avatar
                style={{
                  backgroundColor: randomColor({ seed: user.username }),
                  verticalAlign: 'middle',
                  fontSize: '40px',
                }}
                size={200}
              >
                {user.username}
              </Avatar>
            </AvatarWrapper>
            <InfoWrapper>
              <Descriptions column={1}>
                <Descriptions.Item label="User ID">
                  {user._id}
                </Descriptions.Item>
                <Descriptions.Item label="UserName">
                  {user.username}
                </Descriptions.Item>
                <Descriptions.Item label="Tier">{user.tier}</Descriptions.Item>
                <Descriptions.Item label="Create Time">
                  {dayjs(user.createdAt).format('YYYY-MM-DD')}
                </Descriptions.Item>
              </Descriptions>
            </InfoWrapper>
          </UserInfo>
        </Box>
      )}
    </ContentWrapper>
  );
};

const UserInfo = styled.div`
  width: 100%;
  display: flex;
`;

const AvatarWrapper = styled.div`
  flex-shrink: 0;
  padding: 24px;
`;

const InfoWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 24px;
`;
