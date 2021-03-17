import { Tag } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { examStatusType } from '../constants/examStatusType';

type Props = { status: examStatusType };

export const ExamStatusBadge = ({ status }: Props) => {
  return (
    <TagGroup>
      {status === examStatusType.CONVENING && (
        <Tag color="green">Convening</Tag>
      )}
      {status === examStatusType.ONGOING && <Tag color="blue">Ongoing</Tag>}
      {status === examStatusType.FINISHING && <Tag color="red">Finishing</Tag>}
      {status === examStatusType.ENDED && <Tag color="grey">Ended</Tag>}
    </TagGroup>
  );
};

const TagGroup = styled.span`
  line-height: 100%;

  &::before {
    content: '';
    display: inline-block;
    height: 100%;
    vertical-align: middle;
  }
`;
