import { PureExamResources } from './examResources';
import { PureUser } from './user';

export type PureExam = {
  _id: string;
  visible: boolean;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  createdBy: string;
  from: string;
  to: string;
  invigilator: string[];
  attendee: string[];
  resources: string[];
};

export type DetailedExam = {
  _id: string;
  visible: boolean;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  createdBy: Pick<PureUser, 'username' | '_id'>;
  from: string;
  to: string;
  invigilator: string[];
  attendee: string[];
  resources: string[];
};

export type PopulatedExam = {
  _id: string;
  visible: boolean;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  createdBy: Pick<PureUser, 'username' | '_id'>;
  from: string;
  to: string;
  invigilator: Pick<PureUser, 'username' | '_id'>[];
  attendee: Pick<PureUser, 'username' | '_id'>[];
  resources: PureExamResources[];
};
