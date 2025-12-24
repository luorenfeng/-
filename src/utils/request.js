import axios from "axios"; //引入网络请求
import { ElMessage, ElNotification } from "element-plus"; //引入弹框样式
import router from "../router/index"; //引入路由

// axios.create 创建网络请求实例
const service = axios.create({
  baseURL: "/api",
  timeout: 10000, //超过10秒没响应触发超时错误
});

// 请求拦截器  发出请求前
//interceptors是Axios 里的一个对象  request发数据
//use()接收两个函数，config成功函数和error失败函数
service.interceptors.request.use(
  (config) => {
    //localStorage.getItem从本地存储拿token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = token;
    }
    return config;
  },
  (error) => {
    console.error("请求配置错误", error); //error红色  warn黄色
    return Promise.reject(error);
  }
);

// 响应拦截器  拿到数据后
//response收数据
service.interceptors.response.use(
  // response.data：后端返回的业务数据
  // response.status：HTTP 状态码（200/404/500）
  // response.headers：响应头
  (response) => {
    const res = response.data; //拿到数据后只保留data字段然后赋值给res
    if (res.code === 200) {
      return res;
    } else {
      ElNotification({
        title: "登录失败",
        message: res.message,
        type: "error",
        duration: 2000,
      });
      return Promise.reject(new Error(res.message || "Error"));
    }
  },
  (error) => {
    console.error("网络请求错误:", error);
    let message = "未知错误";
    //error.response判断响应对象是否存在
    if (error.response) {
      const status = error.response.status; //拿到响应失败的状态码
      switch (status) {
        case 400:
          message = "请求参数错误";
          break;
        case 401:
          message = "未授权，请登录";
          if (status === 401) {
            localStorage.removeItem("token");
            router.push("/login");
          }
          break;
        case 403:
          message = "拒绝访问";
          break;
        case 404:
          message = "请求地址出错";
          break;
        case 408:
          message = "请求超时";
          break;
        case 500:
          message = "服务器内部错误";
          break;
        case 502:
          message = "网关错误";
          break;
        case 503:
          message = "服务不可用";
          break;
        case 504:
          message = "网关超时";
          break;
        default:
          message = "网络连接故障";
      }
      //有些错误不是 response，而是 axios 自己抛的，比如超时
    } else if (error.message.includes("timeout")) {
      message = "网络请求超时,请重新尝试";
      //断网、CORS、代理失败等，axios 常抛 Network Error
    } else if (error.message.includes("Network Error")) {
      message = "网络连接异常，请检查网络";
    }
    ElMessage({
      message: message,
      type: "error",
      duration: 1000,
    });
    return Promise.reject(error);
  }
);
export default service;
