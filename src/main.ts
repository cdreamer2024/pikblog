import { createApp } from "vue";
import App from "./App.vue";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
import "./registerServiceWorker";
import router from "./router";
import "./assets/css/global.scss";
import { createPinia } from "pinia";
import piniaPersist from "pinia-plugin-persist";

// 在开发环境下引入 mock
if (process.env.NODE_ENV === "development") {
  import("./mock").then((mock) => {
    console.log("Mock.js 已加载");
  });
}

const pinia = createPinia();
pinia.use(piniaPersist);

createApp(App).use(Antd).use(pinia).use(router).mount("#app");
