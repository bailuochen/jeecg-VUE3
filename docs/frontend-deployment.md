# 前端部署文档

本文说明 JeecgBoot Vue3 主应用和 qiankun 子应用的前端部署方式，并覆盖本地 Nginx 模拟服务器环境。

## 1. 部署目标

生产入口统一由 Nginx 提供：

```text
http://server/
```

本地模拟入口：

```text
http://127.0.0.1:8090/
```

部署后的路由约定：

| 类型 | 地址 |
| --- | --- |
| 主应用 | `/` |
| 主应用内 vue-admin | `/vue-admin/dashboard` |
| 主应用内 jeecg-app-1 | `/jeecg-app-1/dashboard` |
| vue-admin 静态入口 | `/micro-apps/vue-admin/` |
| jeecg-app-1 静态入口 | `/micro-apps/jeecg-app-1/` |
| 后端代理 | `/jeecgboot/` |

注意：子应用静态入口不要使用 `/vue-admin/` 这种主应用业务路由前缀，否则刷新子路由时容易和主应用路由抢路径。

## 2. 构建环境

当前项目使用：

| 项目 | 版本 |
| --- | --- |
| Node.js | 20.20.2 |
| pnpm | 通过 corepack 管理 |
| 主应用 Vite | 6.4.1 |
| 子应用 Vite | 6.4.1 |

本机工具链位置：

```text
tools/node-v20.20.2-win-x64/
tools/corepack/
```

PowerShell 环境变量：

```powershell
$env:COREPACK_HOME='C:\Users\Administrator\Desktop\jeecg-boot-latest\tools\corepack'
$env:PATH='C:\Users\Administrator\Desktop\jeecg-boot-latest\tools\node-v20.20.2-win-x64;' + $env:PATH
```

## 3. 本地 Nginx 模拟部署

本项目已提供本地部署脚本：

```text
deploy/local-nginx/build-local-deploy.ps1
deploy/local-nginx/start-local-nginx.ps1
deploy/local-nginx/stop-local-nginx.ps1
deploy/local-nginx/nginx.conf
```

构建并生成本地部署产物：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy\local-nginx\build-local-deploy.ps1
```

启动 Nginx：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy\local-nginx\start-local-nginx.ps1
```

停止 Nginx：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy\local-nginx\stop-local-nginx.ps1
```

生成目录：

```text
deploy/local-server/html/
├─ index.html
├─ assets/
├─ js/
├─ _app.config.js
└─ micro-apps/
   ├─ jeecg-app-1/
   └─ vue-admin/
```

`deploy/local-server/` 是本地构建产物目录，已加入 `.gitignore`，不要提交。

## 4. 主应用构建

本地模拟部署使用：

```powershell
cd .\jeecgboot-vue3
corepack pnpm build:localdeploy
```

对应环境文件：

```text
jeecgboot-vue3/.env.localdeploy
```

关键配置：

```env
VITE_PUBLIC_PATH=/
VITE_GLOB_API_URL=/jeecgboot
VITE_GLOB_DOMAIN_URL=/jeecgboot
VITE_APP_SUB_jeecg_app_1=/micro-apps/jeecg-app-1/
VITE_APP_SUB_vue_admin=/micro-apps/vue-admin/
```

`VITE_APP_SUB_` 开头的变量会在构建时写入主应用 bundle，生产环境必须重新构建才能生效。

## 5. 子应用构建

每个子应用执行：

```powershell
cd .\vue-admin
corepack pnpm build
```

子应用 `vite.config.ts` 必须使用生产 base：

```ts
base: command === 'build' ? `/micro-apps/${appName}/` : '/',
```

构建后复制到：

```text
deploy/local-server/html/micro-apps/vue-admin/
```

服务器正式部署时也使用同样目录结构：

```text
html/
├─ index.html
└─ micro-apps/
   └─ vue-admin/
      ├─ index.html
      └─ assets/
```

## 6. Nginx 配置

核心规则：

```nginx
server {
  listen 8090;
  server_name 127.0.0.1 localhost;

  root /path/to/html;
  index index.html;

  location /jeecgboot/ {
    proxy_pass http://127.0.0.1:8080/jeecg-boot/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /micro-apps/vue-admin/ {
    root /path/to/html;
    try_files $uri $uri/ /micro-apps/vue-admin/index.html;
  }

  location /micro-apps/jeecg-app-1/ {
    root /path/to/html;
    try_files $uri $uri/ /micro-apps/jeecg-app-1/index.html;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

子应用 location 推荐使用 `root`，不要使用容易和 `$uri` 路径拼接冲突的 `alias`。

## 7. 新增子应用部署步骤

假设新增子应用 `my-app`：

1. `my-app/vite.config.ts` 设置生产 base：

```ts
base: command === 'build' ? '/micro-apps/my-app/' : '/',
```

2. `jeecgboot-vue3/.env.localdeploy` 增加：

```env
VITE_APP_SUB_my_app=/micro-apps/my-app/
```

3. `deploy/local-nginx/build-local-deploy.ps1` 增加构建复制逻辑：

```powershell
Push-Location (Join-Path $repoRoot "my-app")
try {
  Invoke-Native { corepack pnpm build }
  Copy-Item -Path ".\dist" -Destination (Join-Path $htmlRoot "micro-apps\my-app") -Recurse -Force
}
finally {
  Pop-Location
}
```

4. `deploy/local-nginx/nginx.conf` 增加：

```nginx
location /micro-apps/my-app/ {
  root __HTML_ROOT__;
  try_files $uri $uri/ /micro-apps/my-app/index.html;
}
```

5. 重新执行本地部署脚本并 reload Nginx。

## 8. 验证命令

检查 Nginx 配置：

```powershell
& "C:\Users\Administrator\Desktop\jeecg-boot-latest\tools\nginx-1.31.1\nginx.exe" -t -c ".\deploy\local-server\nginx.conf" -p "C:\Users\Administrator\Desktop\jeecg-boot-latest\tools\nginx-1.31.1"
```

检查主应用：

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8090/" -UseBasicParsing
Invoke-WebRequest -Uri "http://127.0.0.1:8090/vue-admin/dashboard" -UseBasicParsing
```

检查子应用入口：

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8090/micro-apps/vue-admin/dashboard" -UseBasicParsing
```

检查 JS 资源 Content-Type，必须是 `application/javascript`：

```powershell
$js = Get-ChildItem .\deploy\local-server\html\micro-apps\vue-admin\assets -Filter "index-*.js" | Select-Object -First 1 -ExpandProperty Name
(Invoke-WebRequest -Uri "http://127.0.0.1:8090/micro-apps/vue-admin/assets/$js" -UseBasicParsing).Headers["Content-Type"]
```

检查后端代理：

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8090/jeecgboot/sys/randomImage/deploy-check" -UseBasicParsing
```

## 9. 常见问题

### 子应用 JS 返回 text/html

原因通常是 Nginx 静态资源路径没有命中，回退到了 `index.html`。

处理：

- 子应用 `base` 是否为 `/micro-apps/{appName}/`。
- Nginx 子应用 location 是否使用 `root`。
- `try_files` fallback 是否指向对应子应用的 `index.html`。

### 刷新 `/vue-admin/dashboard` 显示“查看组件引用是否正确”

处理：

- 主应用 `VITE_APP_SUB_vue_admin` 是否配置。
- 生产模式是否重新构建主应用。
- 菜单 `component` 是否为 `LayoutsContent`。
- 主应用 `src/qiankun/apps.ts` 是否注册到了 `vue-admin`。

### 本地登录后无法进入系统

本地后端默认开启登录验证码。部署验证时可以先确认静态资源、后端代理和登录页可访问；完整业务验收需要手动输入验证码登录，或在本地开发配置中临时关闭登录验证码。

