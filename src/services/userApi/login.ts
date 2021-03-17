import { apiClient } from "./../apiClient";

export const login = async (data: { username: string; password: string }) =>
  apiClient.post<{
    token: string;
    expires: string;
  }>(`/user/login`, data);
