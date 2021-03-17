import { dayjs } from "./dayjs";
import { examStatusType } from "../constants/examStatusType";
import { PopulatedExam, DetailedExam, PureExam } from "./../models/exam";

export const getExamStatus = (
  now: string,
  { from, to }: PureExam | PopulatedExam | DetailedExam
): examStatusType => {
  const conveningTime = dayjs(from).subtract(15, "minute");
  const endTime = dayjs(to).add(15, "minute");

  if (dayjs(now).isBefore(conveningTime)) {
    return examStatusType.UPCOMING;
  } else if (dayjs(now).isBefore(from)) {
    return examStatusType.CONVENING;
  } else if (dayjs(now).isBefore(to)) {
    return examStatusType.ONGOING;
  } else if (dayjs(now).isBefore(endTime)) {
    return examStatusType.FINISHING;
  } else {
    return examStatusType.ENDED;
  }
};
