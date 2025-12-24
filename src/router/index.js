import { createRouter, createWebHistory } from "vue-router";
import { ElNotification } from "element-plus";

const routes = [
  {
    path: "/",
    redirect: "/login", //重定向，访问/路径自动跳到/login
  },
  {
    path: "/login",
    name: "login", //路由的名字
    component: () => import("../login/login.vue"), //访问到这个组件才去加载页面(懒加载)
  },
  {
    path: "/home",
    name: "home",
    component: () => import("../login/home.vue"),
    redirect: "/home/console",
    meta: { requiresAuth: true }, //需要登录才能访问
    children: [
      {
        path: "console",
        name: "console",
        component: () => import("../login/child/console.vue"),
        meta: { title: "控制台" },
      },
      {
        path: "user",
        name: "user",
        component: () => import("../login/child/user.vue"),
        meta: { title: "用户管理" },
      },
      {
        path: "role",
        name: "role",
        component: () => import("../login/child/role.vue"),
        meta: { title: "角色管理" },
      },
      {
        path: "list",
        name: "list",
        component: () => import("../login/child/list.vue"),
        meta: { title: "商品列表" },
      },
      {
        path: "manage",
        name: "manage",
        component: () => import("../login/child/manage.vue"),
        meta: { title: "分类管理" },
      },
    ],
  },
];
//创建路由器实例
const router = createRouter({
  history: createWebHistory(),
  routes, //把数组里面的路由规则（对象）交给路由器
});

//路由前置守卫 每次跳转前先经过这里
//接收三个函数参数，to要去哪里   from从哪里来    next放不放行
router.beforeEach((to) => {
  const token = localStorage.getItem("token");

  // 访问需要登录的页面，但没 token → 去登录
  if (to.meta.requiresAuth && !token) {
    return (
      {
        path: "/login", //要去的地方需要登录并且没有token就返回登录页
        query: { redirect: to.fullPath }, //记录原本想去哪里
      },
      ElNotification({
        title: "请先登录",
        message: "即将返回登录页面",
        type: "warning",
        duration: 2000,
      })
    );
  }

  // 否则放行
  return true;
});

export default router;
