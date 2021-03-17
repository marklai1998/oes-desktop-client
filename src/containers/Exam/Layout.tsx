import { Button } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { Box } from '../../components/Box';
import { PopulatedExam } from '../../types/exam';
import { LeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Avatar from 'antd/lib/avatar/avatar';
import randomColor from 'randomcolor';
import { useAuth } from '../../hooks/useAuth';

type Props = {
  children: React.ReactNode;
  exam: PopulatedExam;
};

export const Layout = ({ children, exam }: Props) => {
  const { user } = useAuth();
  return (
    <Wrapper>
      <Header>
        <NameWrapper>
          <Link to="/">
            <Button type="link" size="large">
              <LeftOutlined />
            </Button>
          </Link>
          Current Exam: {exam.name}
        </NameWrapper>
        <UserWrapper>
          {user && (
            <Avatar
              style={{
                backgroundColor: randomColor({ seed: user.username }),
                verticalAlign: 'middle',
                cursor: 'pointer',
              }}
            >
              {user.username}
            </Avatar>
          )}
        </UserWrapper>
      </Header>
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: #000;
`;

const Header = styled(Box)`
  color: #1890ff;
  font-size: 20px;
  padding: 0 8px;
  line-height: 48px;
  display: flex;

  & button {
    padding: 0 8px;
  }
`;

const NameWrapper = styled.div`
  width: 100%;
`;

const UserWrapper = styled.div`
  flex-shrink: 0;
  align-self: center;
`;
