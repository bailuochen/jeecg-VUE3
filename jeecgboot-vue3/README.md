# 自主开发平台前端主应用

这是一个基于 Vue 3、Vite 6、Ant Design Vue 和 qiankun 的前端主应用。

主应用定位：

- 保留登录、权限管理、菜单管理等基础能力。
- 作为 qiankun 微前端入口承载业务子应用。
- 后端接口前缀保持兼容现有服务，不在前端改动接口路径。

## 快速启动

```powershell
cd .\jeecgboot-vue3
corepack pnpm install
corepack pnpm dev --host 127.0.0.1 --port 3100
```

## 微前端子应用

开发环境子应用配置在 `.env.development`：

```env
VITE_APP_SUB_jeecg_app_1=//127.0.0.1:3101
VITE_APP_SUB_vue_admin=//127.0.0.1:3102
```

本地部署模拟配置在 `.env.localdeploy`：

```env
VITE_APP_SUB_jeecg_app_1=/micro-apps/jeecg-app-1/
VITE_APP_SUB_vue_admin=/micro-apps/vue-admin/
```

更多说明见项目根目录 `docs/`。
