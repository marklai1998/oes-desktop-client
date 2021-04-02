import { Button, Drawer, Input, Steps, Form } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Box } from '../../components/Box';
import { PopulatedExam } from '../../types/exam';
import {
  LeftOutlined,
  MessageOutlined,
  CloudDownloadOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Avatar from 'antd/lib/avatar/avatar';
import randomColor from 'randomcolor';
import { useAuth } from '../../hooks/useAuth';
import { dayjs } from '../../utils/dayjs';
import { useTime } from '../../hooks/useTime';
import * as R from 'ramda';
import { useSocket } from '../../hooks/useSocket';
import { socketEvent } from '../../constants/socketEvent';
import { useFetch } from '../../hooks/useFetch';
import { getResources } from '../../services/examApi/getResources';

const { Step } = Steps;

type Props = {
  children: React.ReactNode;
  exam: PopulatedExam;
};

export const Layout = ({ children, exam }: Props) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const now = useTime();
  const dayjsTime = dayjs(now);
  const [form] = Form.useForm();
  const { fetchData, data } = useFetch(getResources);

  const [chat, setChat] = useState<
    { username: string; timestamp: string; message: string }[]
  >([]);
  const [chatVisible, setChatVisible] = useState(false);
  const [resourcesVisible, setResourcesVisible] = useState(false);

  useEffect(() => {
    fetchData(exam._id);
  }, []);

  const showChat = () => {
    setChatVisible(true);
  };

  const onChatClose = () => {
    setChatVisible(false);
  };

  const showResources = () => {
    setResourcesVisible(true);
  };

  const onResourcesClose = () => {
    setResourcesVisible(false);
  };

  const handleSubmit = ({ chat }: any) => {
    if (!chat || R.isEmpty(chat)) return;
    form.resetFields();

    setChat((prev) => [
      ...prev,
      { username: 'you', timestamp: dayjs().toISOString(), message: chat },
    ]);

    socket &&
      socket.emit(socketEvent.CHAT_MESSAGE, {
        examId: exam._id,
        message: chat,
      });
  };

  const handleChatMessage = useCallback(
    (item: { username: string; timestamp: string; message: string }) => {
      console.log(item);
      setChat((prev) => [...prev, item]);
    },
    []
  );

  useEffect(() => {
    if (!socket) return;
    socket.off(socketEvent.CHAT_MESSAGE);
    socket.on(socketEvent.CHAT_MESSAGE, handleChatMessage);
  }, [socket, handleChatMessage]);

  const times = useMemo(() => {
    const { from, to } = exam;

    return [
      dayjs(from).subtract(15, 'minutes').toISOString(),
      from,
      to,
      dayjs(to).add(15, 'minutes').toISOString(),
    ];
  }, [exam]);

  const step = useMemo(() => {
    const step = R.findIndex((time) => dayjs(time).isAfter(now), times);
    return step === -1 ? 3 : step;
  }, [now]);

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
        <TimeWrapper>
          <Time>{dayjsTime.format('hh:mm:ss A')}</Time>
          <Date>{dayjsTime.format('YYYY-MM-DD')}</Date>
        </TimeWrapper>
        <UserWrapper>
          {user && (
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
          )}
        </UserWrapper>
      </Header>
      {children}
      <TimeLine>
        <Steps current={step} size="small">
          <Step title="Convene" description={dayjs(times[0]).fromNow()} />
          <Step title="Start" description={dayjs(times[1]).fromNow()} />
          <Step title="Finish" description={dayjs(times[2]).fromNow()} />
          <Step title="End" description={dayjs(times[3]).fromNow()} />
        </Steps>
        <Input.Group compact>
          <Button type="primary" onClick={showResources}>
            <CloudDownloadOutlined />
          </Button>
          <Button type="primary" onClick={showChat}>
            <MessageOutlined />
          </Button>
        </Input.Group>
      </TimeLine>
      <Drawer
        title="Chat"
        placement="right"
        onClose={onChatClose}
        visible={chatVisible}
      >
        <DrawerWrapper>
          <ChatHistory>
            {chat.map(({ timestamp, message, username }) => (
              <div key={timestamp}>
                {`[${username}] ${message}`}
                <Date>[{dayjs(timestamp).format('YYYY-MM-DD hh:mm:ss')}]</Date>
              </div>
            ))}
          </ChatHistory>
          <StyledForm onFinish={handleSubmit} form={form}>
            <Input.Group compact>
              <Form.Item noStyle name="chat">
                <Input />
              </Form.Item>
              <Button type="primary" htmlType="submit">
                <RightOutlined />
              </Button>
            </Input.Group>
          </StyledForm>
        </DrawerWrapper>
      </Drawer>
      <Drawer
        title="Resources"
        placement="right"
        onClose={onResourcesClose}
        visible={resourcesVisible}
      >
        <DrawerWrapper>
          {(data || []).map(({ _id, originalname, filename }) => (
            <div key={_id}>
              <a
                href={`/uploads/resources/${filename}`}
                download={originalname}
              >
                {originalname}
              </a>
            </div>
          ))}
        </DrawerWrapper>
      </Drawer>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: #000;
  display: flex;
  flex-direction: column;
`;

const Header = styled(Box)`
  color: #1890ff;
  font-size: 20px;
  padding: 0 8px;
  line-height: 48px;
  display: flex;
  flex-shrink: 0;

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

const TimeLine = styled(Box)`
  padding: 8px 16px;
  display: flex;

  & .ant-steps {
    width: 100%;
  }

  & .ant-steps-item-icon {
    display: inline-flex;
  }

  & .ant-steps-icon {
    width: 100%;
    align-self: center;
  }

  & .ant-input-group {
    align-self: center;
    margin-left: 8px;
    width: unset;
    flex-shrink: 0;
  }
`;

const TimeWrapper = styled.div`
  flex-shrink: 0;
  font-size: 12px;
  line-height: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-right: 8px;
`;

const Time = styled.span`
  margin-right: 8px;
`;

const Date = styled.div`
  color: #575757;
`;

const DrawerWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  font-size: 12px;

  & .ant-input-group {
    display: flex;
  }
`;

const ChatHistory = styled.div`
  height: 100%;
  overflow: auto;
`;

const StyledForm = styled(Form)`
  flex-shrink: 0;
`;
