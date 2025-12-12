import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { message } from "ant-design-vue";
import useUserstore from "../store/index";
import { FormatToken, SettingUserRouter, Vaild } from "../tools";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/main/desktop",
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/usr/LoginView.vue"),
  },
  {
    path: "/main",
    name: "main",
    component: () => import("../views/MainView.vue"),
    redirect: "/main/desktop",
    children: [
      {
        path: "desktop",
        name: "desktop",
        component: () => import("../views/index/DeskTop.vue"),
      },
      {
        path: "personpage",
        name: "personpage",
        component: () => import("../views/index/PersonPage.vue"),
      },
    ],
  },
  {
    path: "/admin",
    name: "admin",
    component: () => import("../views/MainView.vue"),
    redirect: "/admin/user",
    children: [
      {
        path: "user",
        name: "userlist",
        component: () => import("../views/admin/user/UserView.vue"),
      },
      {
        path: "menu",
        name: "menulist",
        component: () => import("../views/admin/menu/MenuView.vue"),
      },
      {
        path: "role",
        name: "rolelist",
        component: () => import("../views/admin/role/RoleView.vue"),
      },
    ],
  },
  {
    path: "/voucher",
    name: "voucher",
    component: () => import("../views/MainView.vue"),
    redirect: "/voucher/",
    children: [
      {
        path: "create",
        name: "create",
        component: () => import("@/views/voucher/VoucherCreate.vue"),
      },
      {
        path: "done",
        name: "done",
        component: () => import("@/views/CreateView.vue"),
      },
      {
        path: "todo",
        name: "todo",
        component: () => import("../views/admin/role/RoleView.vue"),
      },
      {
        path: "details",
        name: "details",
        component: () => import("../views/voucher/FlowHandlerDetails.vue"),
      },
    ],
  },
  {
    path: "/flowhandler",
    name: "flowhandler",
    component: () => import("../views/MainView.vue"),
    redirect: "/flowhandler",
    children: [
      {
        path: "flowhandlerlist",
        name: "flowhandlerlist",
        component: () =>
          import("@/views/admin/flowhandler/FlowHandlerView.vue"),
      },
    ],
  },
  // 404 页面路由
  {
    path: "/:pathMatch(.*)*",
    name: "notfound",
    component: () => import("../views/index/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 路由守卫 - JWT 验证
router.beforeEach(async (to, from, next) => {
  const userStore = useUserstore();

  // 检查 Token 是否存在
  if (!userStore.Token) {
    if (to.path !== "/login" && to.path !== "/") {
      next("/login");
      return;
    }
  } else {
    // 有 Token，验证有效期
    const tokenData = FormatToken(userStore.Token);
    if (tokenData && tokenData.exp) {
      if (!Vaild(tokenData.exp) && to.path !== "/login") {
        message.warning("登录已过有效期，请重新登录！");
        next("/login");
        return;
      }
    } else {
      if (to.path !== "/login") {
        message.warning("登录状态异常，请重新登录！");
        next("/login");
        return;
      }
    }
  }

  // 如果不是登录页，设置用户路由
  if (to.path !== "/login") {
    try {
      await SettingUserRouter();
    } catch (error) {
      console.error("设置用户路由失败:", error);
    }
  }

  next();
});

export default router;
