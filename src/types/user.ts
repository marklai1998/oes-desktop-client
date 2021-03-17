import { userTierType } from '../constants/userTierType';

export type PureUser = {
  _id: string;
  tier: userTierType;
  createdAt?: string;
  updatedAt?: string;
  username: string;
  hash: string;
  salt: string;
};
