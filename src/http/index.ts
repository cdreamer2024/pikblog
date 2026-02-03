import axios from "axios";
import { message, Modal } from "ant-design-vue";
import type { MessageType } from "ant-design-vue/es/message";
import ApiResult from "../class/ApiResult";
import store from "../store/index";
import { FormatToken } from "../tools";
import router from "../router";

const instance = axios.create({
  // timeout:3000
  baseURL: "http://10.140.2.11/evcr",
  headers: {
    "Content-Type": "application/json",
  },
});

// 设置loading - Ant Design Vue 使用 message.loading
let loadingInstance: MessageType | undefined;

// 拦截请求
instance.interceptors.request.use((config) => {
  loadingInstance = message.loading("Loading...", 0); // 0 表示不自动关闭
  // 全局状态管理需要在这里获取，否则会提示没有初始化引用
  config.headers.Authorization = "Bearer " + store().Token;
  return config;
});

// 拦截响应
instance.interceptors.response.use(
  (response) => {
    loadingInstance?.(); // 安全地关闭loading
    // 拿到请求结果后统一返回，并设置返回结果
    const res: ApiResult = response.data;
    if (!res.IsSuccess) {
      message.error(res.Msg);
    }
    // 对于业务模块，只需关注结果，无需做验证提示
    return res.Result;
  },
  // 请求异常走这里
  async (error) => {
    // 请求的配置对象
    const originalRequest = error.config;
    if (!originalRequest) {
      loadingInstance?.();
      return Promise.reject(error);
    }

    // 1、401表示未授权
    // 2、_retry表示是否应该重试
    // 3、RefreshTokenNum表示重试次数
    // 4、如果Pinia里的全局状态等于空，则说明未登录，则不进行刷新逻辑
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      store().RefreshTokenNum < 2 &&
      store().Token !== ""
    ) {
      console.log("进入重试机制...");

      // 安全的处理方式：先检查再使用
      const tokenInfo = FormatToken(store().Token);
      if (!tokenInfo?.Id) {
        console.error("无法获取用户ID");
        loadingInstance?.();
        return Promise.reject(error);
      }

      // 每次重试时设置为true
      originalRequest._retry = true;
      try {
        // 请求刷新token的接口
        const newAccessToken = (await getNewToken(tokenInfo.Id)).data
          .Result as string;
        if (newAccessToken) {
          // 拿到token之后更新全局状态、设置下次请求的token，返回实例
          const num = store().RefreshTokenNum + 1;
          store().$patch({
            Token: newAccessToken,
            RefreshTokenNum: num,
          });
          instance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newAccessToken}`;
          return instance(originalRequest);
        }
      } catch (refreshError) {
        console.error("刷新token失败:", refreshError);
      }
    } else if (
      error.response?.status === 401 &&
      router.currentRoute.value.path !== "/"
    ) {
      console.log("进行路由跳转");
      // 使用 Ant Design Vue 的 Modal 确认框
      Modal.warning({
        title: "登录过期",
        content: "您的登录已过期，请重新登录",
        onOk() {
          router.push({
            path: "/login",
          });
        },
        onCancel() {
          router.push({
            path: "/login",
          });
        },
      });
    } else if (error.response?.status === 500) {
      message.error("内部服务器错误，请检查服务是否启动！");
    } else if (error.response?.status === 404) {
      message.error("接口地址不存在，请检查接口地址！");
    }

    loadingInstance?.(); // 安全地关闭loading
    // 请求失败则返回错误信息
    return Promise.reject(error);
  }
);

// 封装 Ant Design Vue 的提示方法
export const showMessage = {
  success: (msg: string) => message.success(msg),
  error: (msg: string) => message.error(msg),
  warning: (msg: string) => message.warning(msg),
  info: (msg: string) => message.info(msg),
  loading: (msg: string) => message.loading(msg, 0),
};

// 定义请求参数类型 - 使用更严格的类型定义
interface RequestParams {
  [key: string]: unknown;
}

// 登录相关的特定类型
export interface LoginParams {
  username: string;
  password: string;
}

export const getToken = (obj: LoginParams) => {
  return instance.post(`/api/Login/GetToken`, obj);
};

export const getNewToken = (userId: string) => {
  return axios.get(`/api/Login/RefreshToken?userId=${userId}`);
};

// --------------------- 菜单模块 Start ---------------------
interface MenuRequest {
  id?: string;
  name?: string;
  parentId?: string;
  // 添加缺失的属性
  Name?: string;
  Index?: string;
  FilePath?: string;
  ParentId?: string;
  Description?: string;
  // 根据实际API添加更多字段
}

export const getTreeMenu = (obj: MenuRequest) => {
  return instance.post("/api/Menu/GetMenus", obj);
};

export const addMenu = (req: MenuRequest) => {
  return instance.post("/api/Menu/Add", req);
};

export const editMenu = (req: MenuRequest) => {
  return instance.post("/api/Menu/Edit", req);
};

export const delMenu = (id: string) => {
  return instance.get(`/api/Menu/Del?id=${id}`);
};
// --------------------- 菜单模块 End   ---------------------

// --------------------- 角色模块 Start ---------------------
interface RoleRequest {
  Id?: string;
  Name?: string;
  description?: string;
  order?: number;
  IsEnable?: boolean;
  // 根据实际API添加更多字段
}

export const getRoles = (obj: RoleRequest) => {
  return instance.post("/api/Role/GetRoles", obj);
};

export const addRole = (req: RoleRequest) => {
  return instance.post("/api/Role/Add", req);
};

export const editRole = (req: RoleRequest) => {
  return instance.post("/api/Role/Edit", req);
};

export const delRole = (id: string) => {
  return instance.get(`/api/Role/Del?id=${id}`);
};

export const settingMenu = (rid: string, mids: string) => {
  return instance.get(`/api/Menu/SettingMenu?rid=${rid}&mids=${mids}`);
};
// --------------------- 角色模块 End   ---------------------

// --------------------- 用户模块 Start ---------------------
interface UserRequest {
  Id?: string;
  NickName?: string;
  Name?: string;
  UserType?: number;
  Description?: string;
  Password?: string;
  PageIndex?: number;
  PageSize?: number;
  IsEnable?: boolean;
  Image?: string;
  WisUid?: string;
  WisUkey?: string;
  Office?: string;
  OrgCode?: string;
  Flex1?: string;
  Flex2?: string;
  // 根据实际API添加更多字段
}

export const getUsers = (obj: UserRequest) => {
  return instance.post("/api/User/GetUsers", obj);
};

export const addUser = (req: UserRequest) => {
  return instance.post("/api/User/Add", req);
};

export const editUser = (req: UserRequest) => {
  return instance.post("/api/User/Edit", req);
};

export const delUser = (id: string) => {
  return instance.get(`/api/User/Del?id=${id}`);
};

export const settingRole = (uid: string, rids: string) => {
  return instance.get(`/api/User/SettingRole?uid=${uid}&rids=${rids}`);
};
// --------------------- 用户模块 End   ---------------------

// --------------------- 个人信息模块 Start -------------------
interface PersonInfoRequest {
  nickname?: string;
  oldPassword?: string;
  newPassword?: string;
  NickName?: string;
  Password?: string;
  Image?: string;
  uploadMode?: string;
}

export const editPersonInfo = (req: PersonInfoRequest) => {
  return instance.post(`/api/User/EditNickNameOrPassword`, req);
};
// --------------------- 个人信息模块 End ---------------------

// --------------------- FlowHandler ---------------------
interface FlowHandleRequest {
  Id?: string;
  Office?: string;
  DocType?: string;
  IsEnable?: boolean;
  PageIndex?: number;
  PageSize?: number;
  Flex1?: string;
  Flex2?: string;
  FlowStep?: string;
  handler?: string;
}
export const getFlowHandlers = (obj: FlowHandleRequest) => {
  return instance.post("/api/FlowHandler/getFlowHandlers", obj);
};

export const addFlowHandler = (req: FlowHandleRequest) => {
  return instance.post("/api/FlowHandler/Add", req);
};

export const editFlowHandler = (req: FlowHandleRequest) => {
  return instance.post("/api/FlowHandler/Edit", req);
};

export const delFlowHandler = (id: string) => {
  return instance.get(`/api/FlowHandler/Del?id=${id}`);
};

// --------------------- Flow ---------------------
export const GoOn = (req: string[]) => {
  return instance.get("/api/Flow/GoOn", {
    params: { req },
    paramsSerializer: (p) =>
      Object.entries(p)
        .map(([k, v]) =>
          Array.isArray(v)
            ? v.map((item) => `${k}=${item}`).join("&")
            : `${k}=${v}`
        )
        .join("&"),
  });
};

export const GoBack = (flowId: string[], uReason: string) => {
  return instance.get(`/api/Flow/GoBack`, {
    params: {
      flowId: flowId,
      uReason: uReason,
    },
    paramsSerializer: (params) => {
      const parts: string[] = [];

      for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
          for (const item of value) {
            parts.push(`${key}=${encodeURIComponent(item)}`);
          }
        } else {
          parts.push(`${key}=${encodeURIComponent(value as string)}`);
        }
      }

      return parts.join("&");
    },
  });
};

export const getFlowDetails = (flowId: string) => {
  return instance.get(`/api/Flow/FlowDetails?flowId=${flowId}`);
};

export const GoOnSingle = (flowId: string, uComment: string) => {
  return instance.get(
    `/api/Flow/GoOnSingle?flowId=${flowId}&uComment=${uComment}`
  );
};

// --------------------- ComInfo ---------------------
export const getOffice = () => {
  return instance.get(`/api/ComInfo/Office?mode=0`);
};

export const getVoucherType = () => {
  return instance.get(`/api/ComInfo/VoucherType?mode=0`);
};
export default instance;
