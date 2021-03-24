import { Button, Steps } from 'antd';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Box } from '../../components/Box';
import { PopulatedExam } from '../../types/exam';
import { LeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Avatar from 'antd/lib/avatar/avatar';
import randomColor from 'randomcolor';
import { useAuth } from '../../hooks/useAuth';
import { dayjs } from '../../utils/dayjs';
import { useTime } from '../../hooks/useTime';
import * as R from 'ramda';
const { Step } = Steps;

type Props = {
  children: React.ReactNode;
  exam: PopulatedExam;
};

export const Layout = ({ children, exam }: Props) => {
  const { user } = useAuth();
  const now = useTime();
  const dayjsTime = dayjs(now);

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
      </TimeLine>
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

  & .ant-steps-item-icon {
    display: inline-flex;
  }

  & .ant-steps-icon {
    width: 100%;
    align-self: center;
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
