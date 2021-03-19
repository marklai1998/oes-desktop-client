import React from 'react';
import { PopulatedExam } from '../../types/exam';
import { useExamRTC } from './useExamRTC';

type Props = {
  exam: PopulatedExam;
};

export const InvigilatorView = ({ exam }: Props) => {
  const { peers } = useExamRTC({ examId: exam._id, streamReady: true });
  console.log(peers);
  return <div>InvigilatorView</div>;
};
