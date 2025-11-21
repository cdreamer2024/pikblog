import { createApp } from "vue";
import App from "./App.vue";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
import "./registerServiceWorker";
import router from "./router";
import "./assets/css/global.scss";
import { createPinia } from "pinia";
import piniaPersist from "pinia-plugin-persist";

const pinia = createPinia();

pinia.use(piniaPersist);
createApp(App).use(Antd).use(pinia).use(router).mount("#app");
