import React, { useMemo } from 'react';
import styled from 'styled-components';
import { FieldTimeOutlined, LoginOutlined } from '@ant-design/icons';
import { dayjs } from '../../utils/dayjs';
import { Button } from 'antd';
import { useTime } from '../../hooks/useTime';
import { getExamStatus } from '../../utils/getExamStatus';
import { ExamStatusBadge } from '../../components/ExamStatusBadge';
import { PureExam } from '../../types/exam';
import { Link } from 'react-router-dom';

type Props = {
  item: PureExam;
};

export const ListItem = ({ item }: Props) => {
  const now = useTime();

  const status = useMemo(() => getExamStatus(now, item), [now, item]);

  return (
    <Wrapper>
      <MetaWrapper>
        <NameWrapper>
          <Name>{item.name}</Name>
          <ExamStatusBadge status={status} />
        </NameWrapper>
        <Time>
          <FieldTimeOutlined />{' '}
          {`${dayjs(item.from).format('YYYY-MM-DD hh:mm')} - 
       ${dayjs(item.to).format('YYYY-MM-DD hh:mm')}`}
        </Time>
      </MetaWrapper>
      <ControlWrapper>
        <Link to={`/exam/${item._id}/join`}>
          <Button type="link">
            <LoginOutlined />
          </Button>
        </Link>
      </ControlWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  border-top: 1px solid #eee;
  padding: 8px 16px;
  display: flex;
`;

const NameWrapper = styled.div`
  color: #1890ff;
  font-size: 16px;
  height: 24px;
`;

const Name = styled.span`
  margin-right: 8px;
`;

const Time = styled.div`
  font-size: 12px;
  color: #8a8a8a;
`;

const MetaWrapper = styled.div`
  width: 100%;
`;

const ControlWrapper = styled.div`
  flex-shrink: 0;

  & button {
    padding: 0 8px;
  }
`;
