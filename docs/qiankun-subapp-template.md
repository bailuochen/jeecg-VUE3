# Qiankun 子应用模板接入方案

本文说明如何基于 `jeecg-app-1` 复制出新的 qiankun 子应用，并快速接入 JeecgBoot Vue3 主应用。

适用场景：

- 新团队需要基于统一模板创建新的业务子应用。
- 子应用需要同时支持独立运行和嵌入主应用运行。
- 主应用菜单点击、浏览器刷新、直接访问子路由都要正常进入子应用页面。

## 1. 约定

子应用名称、路由前缀、qiankun 注册名必须一致。

示例：

| 项目 | 示例值 |
| --- | --- |
| 子应用目录 | `jeecg-app-2` |
| package name | `jeecg-app-2` |
| qiankun appName | `jeecg-app-2` |
| 主应用路由前缀 | `/jeecg-app-2` |
| 主应用 env 变量 | `VITE_APP_SUB_jeecg-app-2` |
| 子应用开发端口 | `3102` |

推荐端口规则：`jeecg-app-1` 用 `3101`，`jeecg-app-2` 用 `3102`，后续依次递增。

最重要的规则：只要子应用叫 `jeecg-app-2`，主应用路由前缀就必须是 `/jeecg-app-2`，主应用环境变量就必须是 `VITE_APP_SUB_jeecg-app-2`。

## 2. 复制子应用模板

在项目根目录复制模板目录：

```powershell
Copy-Item -Recurse .\jeecg-app-1 .\jeecg-app-2
Remove-Item -Recurse -Force .\jeecg-app-2\node_modules, .\jeecg-app-2\dist -ErrorAction SilentlyContinue
```

进入新子应用目录：

```powershell
cd .\jeecg-app-2
```

复制后不要提交 `node_modules`、`dist`、`.vite` 等构建产物。

## 3. 修改子应用配置

### package.json

将 `name`、端口改成新子应用自己的值：

```json
{
  "name": "jeecg-app-2",
  "scripts": {
    "dev": "vite --host 127.0.0.1 --port 3102",
    "build": "vite build",
    "preview": "vite preview --host 127.0.0.1 --port 4102"
  }
}
```

依赖版本建议保持和模板一致，避免主应用与子应用 Vue/Vite 版本漂移。

### vite.config.ts

修改 `appName` 和端口：

```ts
const appName = 'jeecg-app-2';

export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    qiankun(appName, {
      useDevMode: true,
    }),
  ],
  server: {
    host: '127.0.0.1',
    port: 3102,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
});
```

### src/main.ts

修改 qiankun 模式下的路由 base：

```ts
router = createSubRouter(isQiankun ? '/jeecg-app-2' : '/');
```

### 子应用路由

子应用内部路由只写相对路径，不要带主应用前缀：

```ts
routes: [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'SubDashboard',
    component: Dashboard,
  },
]
```

主应用访问地址会是：

```text
http://127.0.0.1:3100/jeecg-app-2/dashboard
```

新增页面时遵循同一个规则：

| 子应用内部路由 | 主应用菜单 URL |
| --- | --- |
| `/dashboard` | `/jeecg-app-2/dashboard` |
| `/menus` | `/jeecg-app-2/menus` |
| `/orders` | `/jeecg-app-2/orders` |

## 4. qiankun 模式下的页面结构

模板已经内置 `isQiankun` 参数：

- 独立运行 `http://127.0.0.1:3102` 时，可以显示子应用自己的导航和页面头部。
- 嵌入主应用时，只显示业务内容区域，不显示子应用 header 和 menu。

页面组件需要接收：

```ts
defineProps<{
  mainAppData?: Record<string, any>;
  isQiankun?: boolean;
}>();
```

如果某块内容只允许独立运行时显示：

```vue
<header v-if="!isQiankun">
  ...
</header>
```

## 5. 安装依赖并启动子应用

使用项目里的 Node 20.20.2 工具链：

```powershell
$env:COREPACK_HOME='C:\Users\Administrator\Desktop\jeecg-boot-latest\tools\corepack'
$env:PATH='C:\Users\Administrator\Desktop\jeecg-boot-latest\tools\node-v20.20.2-win-x64;' + $env:PATH
corepack pnpm install
corepack pnpm dev
```

确认子应用独立访问正常：

```text
http://127.0.0.1:3102
```

## 6. 主应用 env 配置

编辑主应用：

```text
jeecgboot-vue3/.env.development
```

增加一行：

```env
VITE_APP_SUB_jeecg-app-2=//127.0.0.1:3102
```

注意：

- `VITE_APP_SUB_` 后面的名字必须等于子应用 `appName`。
- 每个 env 变量必须单独一行，不要写到注释后面。
- 修改 `.env.development` 后需要重启主应用前端。

启动或重启主应用：

```powershell
cd ..\jeecgboot-vue3
corepack pnpm dev --host 127.0.0.1 --port 3100
```

## 7. 主应用菜单配置

qiankun 子应用菜单使用 `LayoutsContent` 作为主应用承载组件。

推荐菜单结构：

```text
新子应用
├── 工作台        /jeecg-app-2/dashboard
└── 菜单示例      /jeecg-app-2/menus
```

可通过系统菜单管理界面添加，也可以直接插入数据库。

### SQL 模板

将下面变量替换成实际值：

- `${APP_ID}`：根菜单 ID
- `${DASHBOARD_ID}`：工作台菜单 ID
- `${MENUS_ID}`：菜单示例菜单 ID
- `${APP_NAME}`：子应用名称，例如 `jeecg-app-2`
- `${APP_TITLE}`：菜单标题，例如 `Qiankun 应用 2`
- `${SORT_NO}`：排序号

```sql
INSERT INTO sys_permission (
  id, parent_id, name, url, component, component_name,
  redirect, menu_type, perms, perms_type, sort_no, always_show,
  icon, is_route, is_leaf, keep_alive, hidden, hide_tab,
  description, status, del_flag, rule_flag, create_by, create_time
) VALUES
(
  '${APP_ID}', NULL, '${APP_TITLE}', '/${APP_NAME}', 'LayoutsContent', NULL,
  NULL, 0, NULL, '1', ${SORT_NO}, 1,
  'ant-design:appstore-outlined', 1, 0, 0, 0, 0,
  'qiankun 子应用根菜单', '1', 0, 0, 'admin', NOW()
),
(
  '${DASHBOARD_ID}', '${APP_ID}', '工作台', '/${APP_NAME}/dashboard', 'LayoutsContent', NULL,
  NULL, 1, NULL, '1', 1, 0,
  'ant-design:dashboard-outlined', 1, 1, 0, 0, 0,
  'qiankun 子应用工作台', '1', 0, 0, 'admin', NOW()
),
(
  '${MENUS_ID}', '${APP_ID}', '菜单示例', '/${APP_NAME}/menus', 'LayoutsContent', NULL,
  NULL, 1, NULL, '1', 2, 0,
  'ant-design:menu-outlined', 1, 1, 0, 0, 0,
  'qiankun 子应用菜单示例', '1', 0, 0, 'admin', NOW()
);
```

给角色授权：

```sql
INSERT INTO sys_role_permission (id, role_id, permission_id, data_rule_ids, operate_date)
SELECT REPLACE(UUID(), '-', ''), r.id, p.id, NULL, NOW()
FROM sys_role r
JOIN sys_permission p ON p.id IN ('${APP_ID}', '${DASHBOARD_ID}', '${MENUS_ID}')
WHERE r.role_code IN ('admin', 'vue3')
  AND NOT EXISTS (
    SELECT 1
    FROM sys_role_permission rp
    WHERE rp.role_id = r.id
      AND rp.permission_id = p.id
  );
```

插入后建议清理前端菜单缓存，或重新登录。

如果只接入单个角色，把 `r.role_code IN ('admin', 'vue3')` 改成目标角色编码即可。

## 8. 验证清单

启动服务：

| 服务 | 地址 |
| --- | --- |
| 后端 | `http://localhost:8080/jeecg-boot` |
| 主应用 | `http://127.0.0.1:3100` |
| 新子应用 | `http://127.0.0.1:3102` |

验证项：

- 独立访问 `http://127.0.0.1:3102` 正常。
- 主应用访问 `http://127.0.0.1:3100/jeecg-app-2/dashboard` 正常。
- 在主应用子路由页面刷新，仍正常显示子应用内容。
- 主应用菜单点击进入正常。
- qiankun 模式下不显示子应用自己的 header/menu，只显示业务主内容。

## 9. 模板开发规范

后续基于模板开发业务子应用时，建议保持这些约束：

- `src/main.ts` 中的 qiankun appName/base 只改子应用名，不改挂载流程。
- `vite.config.ts` 保留 `vite-plugin-qiankun`、`cors` 和 `Access-Control-Allow-Origin`。
- 子应用内部布局只负责业务内容；嵌入主应用时不要再渲染自己的 header、侧边栏和全局菜单。
- 子应用新增路由时，同步在主应用菜单里新增完整 URL：`/${APP_NAME}/子路由`。
- 子应用接口、token、用户信息等公共能力优先从主应用传入的 `mainAppData` 中取，避免两套登录状态。
- 不要在子应用里写死主应用端口，除了 `createSubRouter('/子应用名')` 之外，业务代码应尽量只关心自己的内部路由。

## 10. 常见问题

### 主应用里只显示“查看组件引用是否正确”

检查：

- 主应用 `VITE_APP_SUB_子应用名` 是否配置正确。
- 子应用 dev 服务是否启动。
- 主应用是否重启过。
- 数据库菜单 `component` 是否为 `LayoutsContent`。
- 路由是否以 `/${APP_NAME}` 开头。

### 刷新子路由后不显示子应用

检查：

- 主应用 `src/qiankun/apps.ts` 中是否使用 `/${name}` 作为 activeRule。
- `EmptyPage.vue` 是否通过 `isQiankunPath()` 判断 qiankun 路由。
- `src/qiankun/index.ts` 是否等待 `qiankun-content` 容器后再注册。

### 子应用加载后样式或接口异常

检查：

- 子应用 `vite.config.ts` 是否开启 `cors` 和 `Access-Control-Allow-Origin`。
- 子应用内部请求是否使用主应用传入的 token 或统一 API 基地址。
- 不要在 qiankun 模式下重复渲染子应用自己的全局布局。

## 11. 最小改名清单

复制一个新子应用后，至少修改这些位置：

```text
jeecg-app-2/package.json
jeecg-app-2/vite.config.ts
jeecg-app-2/src/main.ts
jeecgboot-vue3/.env.development
数据库 sys_permission
数据库 sys_role_permission
```
