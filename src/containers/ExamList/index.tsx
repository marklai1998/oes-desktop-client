import { Tag } from 'antd';
import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Box, Title } from '../../components/Box';
import { ContentWrapper } from '../../components/ContentWrapper';
import { examStatusType } from '../../constants/examStatusType';
import { useFetch } from '../../hooks/useFetch';
import { useDate, useTime } from '../../hooks/useTime';
import { listAllExam } from '../../services/examApi/listAllExam';
import { getExamStatus } from '../../utils/getExamStatus';
import { ListItem } from './ListItem';

const ExamList = () => {
  const now = useTime();
  const date = useDate();
  const { fetchData, data } = useFetch(listAllExam, {
    fallBackValue: { count: 0, list: [] },
  });

  useEffect(() => {
    fetchData();
  }, [date]);

  const list = useMemo(() => (data ? data.list : []), [data]);

  const { upcomingCount, finishedCount } = useMemo(
    () =>
      list.reduce(
        (acc, item) => {
          const status = getExamStatus(now, item);
          return {
            upcomingCount:
              status === examStatusType.UPCOMING
                ? acc.upcomingCount + 1
                : acc.upcomingCount,
            finishedCount:
              status === examStatusType.ENDED
                ? acc.finishedCount + 1
                : acc.finishedCount,
          };
        },
        {
          upcomingCount: 0,
          finishedCount: 0,
        }
      ),
    [list, now]
  );

  return (
    <ContentWrapper>
      <Box>
        <Title>
          My Exam
          <TagWrapper>
            <TagGroup>
              <Tag color="#2db7f5">Upcoming: {upcomingCount}</Tag>
              <Tag color="grey">Ended: {finishedCount}</Tag>
            </TagGroup>
          </TagWrapper>
        </Title>
        {list.map((item) => (
          <ListItem item={item} key={String(item._id)} />
        ))}
      </Box>
    </ContentWrapper>
  );
};

export default ExamList;

const TagGroup = styled.div`
  & span {
    vertical-align: text-bottom;
  }
`;

const TagWrapper = styled.div`
  float: right;
  height: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
