# 本地 Nginx 部署模拟

本目录用于在没有真实服务器时，使用本机 Nginx 模拟生产部署。

## 访问地址

- 主应用：`http://127.0.0.1:8090/`
- 主应用内 jeecg-app-1 路由：`http://127.0.0.1:8090/jeecg-app-1/dashboard`
- 主应用内 vue-admin 路由：`http://127.0.0.1:8090/vue-admin/dashboard`
- 子应用独立入口 jeecg-app-1：`http://127.0.0.1:8090/micro-apps/jeecg-app-1/dashboard`
- 子应用独立入口 vue-admin：`http://127.0.0.1:8090/micro-apps/vue-admin/dashboard`
- 后端代理：`http://127.0.0.1:8090/jeecgboot`

## 目录约定

构建产物会复制到：

```text
deploy/local-server/html/
├── index.html
├── assets/
├── js/
├── _app.config.js
└── micro-apps/
    ├── jeecg-app-1/
    └── vue-admin/
```

## 关键配置

主应用本地部署环境文件：

```text
jeecgboot-vue3/.env.localdeploy
```

子应用生产构建会自动使用：

```text
base: /micro-apps/jeecg-app-1/
base: /micro-apps/vue-admin/
```

这样 Nginx 才能正确加载子应用自己的 `assets`，也能避免子应用静态入口和主应用业务路由 `/jeecg-app-1/**`、`/vue-admin/**` 互相抢路由。
