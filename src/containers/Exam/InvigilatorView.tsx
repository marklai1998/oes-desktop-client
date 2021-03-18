import React from 'react';
import { PopulatedExam } from '../../types/exam';
import { useExamRTC } from './useExamRTC';

type Props = {
  exam: PopulatedExam;
};

export const InvigilatorView = ({ exam }: Props) => {
  useExamRTC({ examId: exam._id });

  return <div>InvigilatorView</div>;
};
