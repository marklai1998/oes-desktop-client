import { Avatar, Dropdown, Menu } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import { LogoutOutlined, ProfileOutlined } from '@ant-design/icons';
import randomColor from 'randomcolor';
import { PageLoading } from '../../components/PageLoading';
import { useSocket } from '../../hooks/useSocket';
import { useHistory, useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import { match } from 'node-match-path';

type Props = {
  children: React.ReactNode;
};

export const Layout = ({ children }: Props) => {
  const browserHistory = useHistory();
  const { user, logout, isAuthing } = useAuth();
  const { socket } = useSocket();
  const { pathname } = useLocation();

  const { matches: inExam } = match('/exam/:id/join', pathname);

  return isAuthing || !socket ? (
    <PageLoading />
  ) : inExam ? (
    <Wrapper>{children}</Wrapper>
  ) : (
    <Wrapper>
      <ColWrapper>
        <ColorBackground />
        <Header>
          <LogoWrapper to="/">
            <Logo src={logo} /> OES
          </LogoWrapper>
          <NavWrapper></NavWrapper>
          <UserWrapper>
            {user ? (
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item icon={<LogoutOutlined />} onClick={logout}>
                      Logout
                    </Menu.Item>
                    <Menu.Item
                      icon={<ProfileOutlined />}
                      onClick={() => {
                        browserHistory.push('/profile');
                      }}
                    >
                      Profile
                    </Menu.Item>
                  </Menu>
                }
              >
                <Avatar
                  style={{
                    backgroundColor: randomColor({ seed: user.username }),
                    verticalAlign: 'middle',
                    cursor: 'pointer',
                  }}
                  src={`http://localhost:3000/uploads/icons/${user._id}`}
                >
                  {user.username}
                </Avatar>
              </Dropdown>
            ) : (
              <Link to="/login">
                <StyledLink>Login</StyledLink>
              </Link>
            )}
          </UserWrapper>
        </Header>
        <ContentWrapper>{children}</ContentWrapper>
      </ColWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  height: 100%;
  max-height: 100%;
`;

const ColWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
`;

const ContentWrapper = styled.div`
  overflow: auto;
`;

const ColorBackground = styled.div`
  width: 100%;
  position: absolute;
  z-index: -100;
  height: 300px;
  background: rgb(44, 197, 189);
  background: linear-gradient(
    171deg,
    rgba(44, 197, 189, 1) 34%,
    rgba(44, 199, 149, 1) 100%
  );
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  padding: 16px 24px;
  display: flex;
  color: #fff;
  line-height: 40px;
`;

const LogoWrapper = styled(Link)`
  font-size: 20px;
  flex-shrink: 0;
  cursor: pointer;

  display: flex;
  color: #fff;
`;

const Logo = styled.img`
  width: 40px;
`;

const NavWrapper = styled.div`
  width: 100%;
`;

const UserWrapper = styled.div`
  flex-shrink: 0;
`;

const StyledLink = styled.a`
  color: #fff;
`;
