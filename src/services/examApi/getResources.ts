import { apiClient } from '../apiClient';

export type PureExamResources = {
  _id: ObjectId | string;
  examId: ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
  order: number;
};

export const getResources = async (id: string) => {
  return apiClient.get<PureExamResources[]>(`/exam/${id}/resources`);
};
