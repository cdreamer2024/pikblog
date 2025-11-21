import router from "../router/index";
import TreeModel from "../class/TreeMenu";
import TagModel from "../class/TagModel";
import store from "../store/index";
import { jwtDecode } from "jwt-decode";
import UserInfo from "../class/UserInfo";
import { getTreeMenu } from "../http";

//选择菜单时添加的tag
export const handleSelect = (index: string) => {
  if (index == "/") return;
  const name = router.getRoutes().filter((item) => item.path == index)[0]
    .name as string;
  const model: TagModel = {
    Name: name,
    Index: index,
    Checked: false,
  };
  const tags: Array<TagModel> = store().tags;
  if (tags.find((p) => p.Index == index) == undefined) {
    tags.push(model);
    store().$patch({
      tags: tags,
    });
  }
  tagClick(index);
};

//点击tag，设置checked，更新store,跳转路由
export const tagClick = (index: string) => {
  if (index == "/") return;
  const curr = store().tags;
  curr.forEach((p) => {
    if (p.Index == index) {
      p.Checked = true;
    } else {
      p.Checked = false;
    }
  });

  store().$patch({
    tags: curr,
  });

  router.push({
    path: index,
  });
};

//解析token
export const FormatToken = (token: string): any => {
  // 彻底检查 token 有效性
  if (
    !token ||
    typeof token !== "string" ||
    token.trim() === "" ||
    token === "null" ||
    token === "undefined" ||
    token === '""' ||
    token === "''"
  ) {
    return null;
  }

  // 移除可能的引号
  const cleanToken = token.replace(/^['"]|['"]$/g, "");

  // JWT token 必须包含两个点，分成三部分
  const tokenParts = cleanToken.split(".");
  if (tokenParts.length !== 3) {
    return null;
  }

  // 检查每个部分都不为空且是有效的 base64
  for (let i = 0; i < tokenParts.length; i++) {
    const part = tokenParts[i].trim();
    if (part === "") {
      return null;
    }

    // 检查是否是有效的 base64 字符串
    try {
      if (i < 2) {
        // header 和 payload 应该是 base64
        atob(part);
      }
    } catch (e) {
      return null;
    }
  }

  try {
    const decoded = jwtDecode(cleanToken);
    return decoded;
  } catch (error) {
    console.warn("Token decode failed:", error);
    return null;
  }
};
// 验证token时间有效性，有效返回true
export const Vaild = (val: number): boolean => {
  if (val) {
    if (FormatDate(val) >= GetDate()) {
      return true;
    }
  }
  return false;
};
// 格式化时间
export const FormatDate = (val: number) => {
  //PS：注意这个地方，要乘以1000
  const dt = new Date(val * 1000);
  const y = dt.getFullYear();
  const m = (dt.getMonth() + 1 + "").padStart(2, "0");
  const d = (dt.getDate() + "").padStart(2, "0");
  const hh = (dt.getHours() + "").padStart(2, "0");
  const mm = (dt.getMinutes() + "").padStart(2, "0");
  const ss = (dt.getSeconds() + "").padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
};

// 获取当前时间
export const GetDate = () => {
  const dt = new Date();
  const y = dt.getFullYear();
  const m = (dt.getMonth() + 1 + "").padStart(2, "0");
  const d = (dt.getDate() + "").padStart(2, "0");
  const hh = (dt.getHours() + "").padStart(2, "0");
  const mm = (dt.getMinutes() + "").padStart(2, "0");
  const ss = (dt.getSeconds() + "").padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
};

// 获取所有 Vue 组件文件
const getVueComponents = () => {
  // 使用 require.context 获取所有 Vue 组件
  const viewsContext = require.context("../views", true, /\.vue$/);
  const components: Array<{ filepath: string; component: any }> = [];

  viewsContext.keys().forEach((key) => {
    components.push({
      filepath: key,
      component: viewsContext(key).default || viewsContext(key),
    });
  });

  return components;
};

// 设置用户动态路由，更新全局状态
export const SettingUserRouter = async (): Promise<boolean> => {
  try {
    // 使用 require.context 获取所有 Vue 组件文件
    const localArr = getVueComponents();

    const obj = {
      Name: "",
      Index: "",
      FilePath: "",
      ParentId: "",
      Description: "",
    };

    const tree: Array<TreeModel> = (await getTreeMenu(
      obj
    )) as any as Array<TreeModel>;

    // 递归路由，将list转为tree
    const list: Array<TreeModel> = RecursiveRoutes(tree);

    let addedRoutesCount = 0;

    list.forEach((p) => {
      const componentInfo = localArr.find((s) =>
        s.filepath.includes(p.FilePath)
      );

      if (componentInfo) {
        // 动态添加路由
        router.addRoute("admin", {
          name: p.Name,
          path: p.Index,
          component: componentInfo.component,
        });
        addedRoutesCount++;
        console.log(`✅ 路由添加成功: ${p.Name} (${p.Index})`);
      } else {
        console.warn(`⚠️ 未找到组件文件: ${p.FilePath}`, p);
      }
    });

    console.log(`🎉 动态路由设置完成，共添加 ${addedRoutesCount} 个路由`);

    // 更新全局状态
    store().$patch({
      UserMenus: tree,
    });

    return true;
  } catch (error) {
    console.error("❌ 设置用户路由失败:", error);
    return false;
  }
};

// 递归路由，输出list
export const RecursiveRoutes = (tree: Array<TreeModel>) => {
  let list: Array<TreeModel> = [];
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.Children) {
      const childrenList = RecursiveRoutes(node.Children);
      list = list.concat(childrenList);
    }
    if (node.FilePath == "") {
      continue;
    }
    list.push({
      Id: node.Id,
      Index: node.Index,
      Name: node.Name,
      Icon: node.Icon,
      FilePath: node.FilePath,
      Children: node.Children,
    });
  }
  return list;
};
