import axios from "axios";
import * as R from "ramda";

export const apiClient = axios.create({
  baseURL: "/api",
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const token = localStorage.getItem("id_token");

    return token
      ? R.assocPath(["headers", "Authorization"], `Bearer ${token}`, config)
      : config;
  } catch (e) {
    // no need error handler to prevent error on not logged in user
    return config;
  }
});

apiClient.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error.response.data === "USER_NOT_FOUND") {
      localStorage.removeItem("id_token");
      localStorage.removeItem("expires_at");
    }

    return Promise.reject(error);
  }
);
