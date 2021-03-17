import { PureUser } from '../../types/user';
import { apiClient } from '../apiClient';

export const getUser = async () => apiClient.get<PureUser>(`/user`);
