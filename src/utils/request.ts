import axios from "axios";
import useUserStore from "@/store/index"; // 根据你的实际路径调整

const request = axios.create({
  baseURL: "http://10.140.2.11/evcr/api",
  timeout: 10000,
});

request.interceptors.request.use(
  (config) => {
    // 从 Pinia 获取 token
    const userStore = useUserStore();
    const token = userStore.Token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 清除 Pinia 中的 token
      const userStore = useUserStore();
      userStore.reset(); // 调用 reset 方法清除所有状态
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default request;
