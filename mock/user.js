// 1. 定义一份用户数据表 (模拟数据库)
const userList = [
  {
    username: "123",
    password: "456",
    role: "super_admin", // 超级管理员 (能看所有菜单)
    token: "token-admin-88888",
    name: "超级管理员书砚",
  },
  {
    username: "123",
    password: "123",
    role: "normal", // 普通用户 (看不到商品管理)
    token: "token-user-66666",
    name: "普通员工李四",
  },
  {
    username: "456",
    password: "123",
    role: "guest", // 访客
    token: "token-guest-00000",
    name: "访客王五",
  },
];

export default [
  {
    url: "/api/login",
    method: "post",
    response: ({ body }) => {
      console.log("Mock收到了登录请求:", body);
      const { username, password } = body;

      // 2. 核心逻辑修改：不再用 if 判断，而是用 find 去数组里找
      // 意思：去 userList 里找，有没有那个 用户名和密码 都对得上的人？
      const user = userList.find(
        (item) => item.username === username && item.password === password
      );

      // 3. 判断结果
      if (user) {
        // 找到了！返回这个人的具体信息
        return {
          code: 200,
          message: "登录成功",
          data: {
            token: user.token, // 返回这个人的专属 token
            name: user.name, // 返回显示的昵称
            role: user.role, //关键：把这个人的角色返回给前端
          },
        };
      } else {
        // 没找到
        return {
          code: 400,
          message: "用户名123---密码456",
        };
      }
    },
  },
];
