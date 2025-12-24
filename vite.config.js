import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// 1. 引入插件 (你原来已经写了，很好)
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

//引入 Mock 插件
import { viteMockServe } from "vite-plugin-mock";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),

    //2. 关键在这里！必须把它们加进 plugins 数组里
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    //配置 Mock 插件 (加这一段)
    viteMockServe({
      mockPath: "mock", // 告诉它假数据文件放在根目录的 mock 文件夹下
      localEnabled: true, // 开发环境是否开启 (这一项必须是 true)
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
