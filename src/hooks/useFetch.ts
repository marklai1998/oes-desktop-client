import { refreshToken } from "./../services/userApi/refreshToken";
import { AxiosResponse } from "axios";
import * as R from "ramda";
import { useState } from "react";
import { dayjs } from "../utils/dayjs";
import { userState } from "../recoil/user";
import { useRecoilState } from "recoil";

type Config<T extends any> = {
  fallBackValue: T;
  clearOnFetch?: boolean;
  dataTransformer?: (input: T) => T;
};

export const useFetch = <T extends any>(
  apiClient: (...arg: any[]) => Promise<AxiosResponse<T>>,
  config?: Config<T>
) => {
  const [fetchResult, setFetchResult] = useState<T | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [, setUser] = useRecoilState(userState);

  const fallbackValue = config ? config.fallBackValue : null;
  const clearOnFetch =
    config && !R.isNil(config.clearOnFetch) ? config.clearOnFetch : true;

  const handleLogout = () => {
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
    setUser(null);
  };

  const checkToken = () => {
    const expireDate = localStorage.getItem("expires_at");
    if (expireDate && dayjs().isAfter(expireDate)) {
      handleLogout();
    }
  };

  const handleRefreshToken = async () => {
    try {
      const { data } = await refreshToken();
      if (data) {
        localStorage.setItem("id_token", data.token);
        localStorage.setItem("expires_at", data.expires);
      }
    } catch (e) {
      console.log(e);
      handleLogout();
    }
  };

  const fetchData = async (...args: Parameters<typeof apiClient>) => {
    try {
      checkToken();
      const tokenExpiryDate = localStorage.getItem("expires_at");
      if (tokenExpiryDate && dayjs().isSame(tokenExpiryDate, "day")) {
        await handleRefreshToken();
      }

      setIsFetching(true);
      clearOnFetch && setFetchResult(null);

      const { data: result } = await apiClient(...args);

      const transformedResult =
        config && config.dataTransformer
          ? config.dataTransformer(result)
          : result;

      setFetchResult(transformedResult || fallbackValue);
      setIsFetching(false);

      return { success: true, result: transformedResult || fallbackValue };
    } catch (e) {
      setIsFetching(false);

      setFetchResult(fallbackValue);
      return {
        success: false,
        result: fallbackValue,
        error: e.response.data || "",
      };
    }
  };

  return {
    fetchData,
    data: fetchResult,
    isFetching,
    clearData: () => setFetchResult(null),
  };
};
