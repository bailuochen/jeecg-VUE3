# 前端环境搭建文档

本文说明如何在本机搭建 JeecgBoot Vue3 主应用和 qiankun 子应用开发环境。

## 1. 项目目录

```text
JeecgBoot-3.9.2/
├─ jeecgboot-vue3/       # 主应用
├─ jeecg-app-1/          # qiankun 子应用模板
├─ vue-admin/            # qiankun 子应用示例
├─ jeecg-boot/           # 后端
├─ deploy/local-nginx/   # 本地 Nginx 部署脚本
└─ docs/                 # 项目文档
```

## 2. 工具版本

| 工具 | 版本 |
| --- | --- |
| Node.js | 20.20.2 |
| pnpm | corepack 管理 |
| 主应用 Vite | 6.4.1 |
| 子应用 Vite | 6.4.1 |
| Vue | 主应用 3.5.x，子应用 3.5.27 |
| Java | 后端按 JeecgBoot 3.9.2 要求配置 |
| Nginx | 本地工具目录 `tools/nginx-1.31.1` |

本机 Node 工具链：

```text
C:\Users\Administrator\Desktop\jeecg-boot-latest\tools\node-v20.20.2-win-x64
C:\Users\Administrator\Desktop\jeecg-boot-latest\tools\corepack
```

## 3. PowerShell 初始化

每次新开 PowerShell 后执行：

```powershell
$env:COREPACK_HOME='C:\Users\Administrator\Desktop\jeecg-boot-latest\tools\corepack'
$env:PATH='C:\Users\Administrator\Desktop\jeecg-boot-latest\tools\node-v20.20.2-win-x64;' + $env:PATH
node -v
corepack pnpm -v
```

如果系统 PATH 已经配置好 Node，也可以直接使用系统 Node，但版本建议保持 `20.20.2`。

## 4. 安装依赖

主应用：

```powershell
cd .\jeecgboot-vue3
corepack pnpm install
```

子应用：

```powershell
cd ..\jeecg-app-1
corepack pnpm install

cd ..\vue-admin
corepack pnpm install
```

不要提交以下目录：

```text
node_modules/
dist/
.vite/
deploy/local-server/
```

## 5. 启动开发服务

后端默认地址：

```text
http://127.0.0.1:8080/jeecg-boot
```

主应用：

```powershell
cd .\jeecgboot-vue3
corepack pnpm dev --host 127.0.0.1 --port 3100
```

子应用 `jeecg-app-1`：

```powershell
cd .\jeecg-app-1
corepack pnpm dev
```

子应用 `vue-admin`：

```powershell
cd .\vue-admin
corepack pnpm dev
```

开发访问地址：

| 服务 | 地址 |
| --- | --- |
| 主应用 | `http://127.0.0.1:3100` |
| jeecg-app-1 独立运行 | `http://127.0.0.1:3101` |
| vue-admin 独立运行 | `http://127.0.0.1:3102` |
| 主应用内 jeecg-app-1 | `http://127.0.0.1:3100/jeecg-app-1/dashboard` |
| 主应用内 vue-admin | `http://127.0.0.1:3100/vue-admin/dashboard` |

## 6. 开发环境变量

主应用开发环境文件：

```text
jeecgboot-vue3/.env.development
```

qiankun 关键配置：

```env
VITE_GLOB_APP_OPEN_QIANKUN=true
VITE_APP_SUB_jeecg_app_1=//127.0.0.1:3101
VITE_APP_SUB_vue_admin=//127.0.0.1:3102
```

新增子应用时继续追加：

```env
VITE_APP_SUB_my_app=//127.0.0.1:3103
```

修改 `.env.development` 后需要重启主应用开发服务。

## 7. 本地部署环境

本地部署模拟使用：

```text
jeecgboot-vue3/.env.localdeploy
deploy/local-nginx/
```

一键构建：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy\local-nginx\build-local-deploy.ps1
```

启动本地 Nginx：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy\local-nginx\start-local-nginx.ps1
```

访问：

```text
http://127.0.0.1:8090/
```

## 8. 推荐开发流程

1. 启动后端。
2. 启动主应用 `3100`。
3. 启动需要开发的子应用。
4. 在主应用菜单里进入子应用路由。
5. 修改子应用页面，确认主应用内热更新正常。
6. 完成后执行本地部署构建。
7. 用 `8090` 验证生产模式路由和静态资源。

## 9. 常见问题

### corepack 或 pnpm 不存在

检查当前 PowerShell 是否设置了 Node 工具链 PATH：

```powershell
node -v
corepack --version
```

如果没有输出，重新执行本文第 3 节的初始化命令。

### 主应用无法加载子应用

检查：

- 子应用开发服务是否启动。
- `.env.development` 中 `VITE_APP_SUB_子应用名` 是否正确。
- 修改 env 后主应用是否已重启。
- 子应用 `vite.config.ts` 是否开启 `cors`。

### 子应用独立运行正常，嵌入主应用空白

检查：

- `src/main.ts` 中 qiankun appName 是否和目录名一致。
- qiankun 模式下 router base 是否为 `/${appName}`。
- 主应用菜单 `component` 是否为 `LayoutsContent`。
- 浏览器控制台是否有跨域或资源 404。

### 生产模式刷新子路由异常

检查：

- 子应用生产 `base` 是否为 `/micro-apps/{appName}/`。
- Nginx 是否配置了 `/micro-apps/{appName}/` location。
- 主应用路由 `/appName/**` 是否回退到主应用 `index.html`。
- 子应用静态资源是否返回 `application/javascript`，不是 `text/html`。

