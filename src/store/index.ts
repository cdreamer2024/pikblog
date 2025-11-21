import { defineStore } from "pinia";
import TagModel from "../class/TagModel";
import TreeModel from "../class/TreeMenu";
const useUserStore = defineStore("main", {
  state: () => {
    return {
      Token: "",
      isCollapse: false,
      //所有这些属性都将自动推断其类型
      tags: [] as TagModel[],
      UserMenus: [] as TreeModel[],
      //token刷新次数
      RefreshTokenNum: 0,
    };
  },
  //状态管理
  persist: {
    //开启
    enabled: true,
    strategies: [
      {
        //指定Key,这个名称会在浏览器本地存储中生成对应的name
        key: "site",
        //自定义存储方式，默认是sessionStorage
        storage: localStorage,
      },
    ],
  },
  actions: {
    reset() {
      this.Token = "";
      this.isCollapse = false;
      this.tags = [];
      this.UserMenus = [];
      this.RefreshTokenNum = 0;
    },
  },
});

export default useUserStore;
