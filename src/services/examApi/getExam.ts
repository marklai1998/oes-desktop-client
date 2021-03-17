import { PureExam } from "./../../../server/models/exam";
import { apiClient } from "../apiClient";

export const getExamDetail = async (id: string) =>
  apiClient.get<PureExam>(`/exam/${id}`);
