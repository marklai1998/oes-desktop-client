import { PureUser } from './../types/user';
import { atom } from 'recoil';

export const userState = atom<null | PureUser>({
  key: 'user',
  default: null,
});
