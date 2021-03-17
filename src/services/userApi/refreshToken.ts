import { apiClient } from "../apiClient";

export const refreshToken = async () =>
  apiClient.get<{
    token: string;
    expires: string;
  }>(`/user/refreshToken`);
