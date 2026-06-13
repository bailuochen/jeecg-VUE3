# 前端子应用开发文档

本文说明如何基于当前项目开发 qiankun 前端子应用，并接入 JeecgBoot Vue3 主应用。

## 1. 当前约定

主应用目录：

```text
jeecgboot-vue3/
```

已接入的子应用：

```text
jeecg-app-1/
vue-admin/
```

子应用技术版本保持一致：

| 项目 | 版本 |
| --- | --- |
| Node.js | 20.20.2 |
| Vue | 3.5.27 |
| Vite | 6.4.1 |
| vue-router | 4.6.4 |
| vite-plugin-qiankun | 1.0.15 |

命名必须统一：

| 项目 | 示例 |
| --- | --- |
| 子应用目录 | `vue-admin` |
| package name | `vue-admin` |
| qiankun appName | `vue-admin` |
| 主应用路由前缀 | `/vue-admin` |
| 开发环境变量 | `VITE_APP_SUB_vue_admin` |
| 生产静态入口 | `/micro-apps/vue-admin/` |

环境变量中 `VITE_APP_SUB_` 后面使用下划线写法，主应用会自动把下划线转换成连字符。

## 2. 创建新子应用

推荐从 `jeecg-app-1` 复制模板：

```powershell
Copy-Item -Recurse .\jeecg-app-1 .\my-app
Remove-Item -Recurse -Force .\my-app\node_modules, .\my-app\dist -ErrorAction SilentlyContinue
```

修改 `my-app/package.json`：

```json
{
  "name": "my-app",
  "scripts": {
    "dev": "vite --host 127.0.0.1 --port 3103",
    "build": "vite build",
    "preview": "vite preview --host 127.0.0.1 --port 4103"
  }
}
```

修改 `my-app/vite.config.ts`：

```ts
const appName = 'my-app';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? `/micro-apps/${appName}/` : '/',
  plugins: [
    vue(),
    qiankun(appName, {
      useDevMode: true,
    }),
  ],
  server: {
    host: '127.0.0.1',
    port: 3103,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
}));
```

修改 `my-app/src/main.ts` 中 qiankun 模式的路由 base：

```ts
router = createSubRouter(isQiankun ? '/my-app' : '/');
```

## 3. 路由开发规则

子应用内部路由只写自身路由，不带主应用前缀：

```ts
const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    component: Dashboard,
  },
  {
    path: '/menus',
    component: Menus,
  },
];
```

主应用菜单配置时补完整路径：

| 子应用内部路由 | 主应用菜单 URL |
| --- | --- |
| `/dashboard` | `/my-app/dashboard` |
| `/menus` | `/my-app/menus` |

## 4. qiankun 模式布局规则

子应用必须同时支持两种运行方式：

| 运行方式 | 访问地址 | 布局要求 |
| --- | --- | --- |
| 独立运行 | `http://127.0.0.1:3103` | 可显示子应用自己的 header/menu |
| 嵌入主应用 | `http://127.0.0.1:3100/my-app/dashboard` | 不显示子应用 header/menu，只显示业务主内容 |

组件中通过 `isQiankun` 判断：

```vue
<template>
  <SubLayout v-if="!isQiankun" />
  <main>
    <!-- 业务内容 -->
  </main>
</template>
```

页面需要接收主应用传参：

```ts
defineProps<{
  mainAppData?: Record<string, any>;
  isQiankun?: boolean;
}>();
```

公共能力建议从 `mainAppData` 获取，例如 token、用户信息、租户信息、API 地址等。

## 5. 主应用接入配置

开发环境编辑：

```text
jeecgboot-vue3/.env.development
```

增加：

```env
VITE_APP_SUB_my_app=//127.0.0.1:3103
```

本地生产模拟环境编辑：

```text
jeecgboot-vue3/.env.localdeploy
```

增加：

```env
VITE_APP_SUB_my_app=/micro-apps/my-app/
```

主应用会在 `src/qiankun/apps.ts` 中读取所有 `VITE_APP_SUB_` 开头的变量并注册子应用。

## 6. 菜单配置

qiankun 子应用菜单组件统一使用：

```text
LayoutsContent
```

示例 SQL：

```sql
INSERT INTO sys_permission (
  id, parent_id, name, url, component, component_name,
  redirect, menu_type, perms, perms_type, sort_no, always_show,
  icon, is_route, is_leaf, keep_alive, hidden, hide_tab,
  description, status, del_flag, rule_flag, create_by, create_time
) VALUES
(
  'my_app_root', NULL, 'My App', '/my-app', 'LayoutsContent', NULL,
  NULL, 0, NULL, '1', 100, 1,
  'ant-design:appstore-outlined', 1, 0, 0, 0, 0,
  'qiankun 子应用根菜单', '1', 0, 0, 'admin', NOW()
),
(
  'my_app_dashboard', 'my_app_root', '工作台', '/my-app/dashboard', 'LayoutsContent', NULL,
  NULL, 1, NULL, '1', 1, 0,
  'ant-design:dashboard-outlined', 1, 1, 0, 0, 0,
  'qiankun 子应用工作台', '1', 0, 0, 'admin', NOW()
),
(
  'my_app_menus', 'my_app_root', '菜单示例', '/my-app/menus', 'LayoutsContent', NULL,
  NULL, 1, NULL, '1', 2, 0,
  'ant-design:menu-outlined', 1, 1, 0, 0, 0,
  'qiankun 子应用菜单示例', '1', 0, 0, 'admin', NOW()
);
```

授权给角色：

```sql
INSERT INTO sys_role_permission (id, role_id, permission_id, data_rule_ids, operate_date)
SELECT REPLACE(UUID(), '-', ''), r.id, p.id, NULL, NOW()
FROM sys_role r
JOIN sys_permission p ON p.id IN ('my_app_root', 'my_app_dashboard', 'my_app_menus')
WHERE r.role_code IN ('admin', 'vue3')
  AND NOT EXISTS (
    SELECT 1
    FROM sys_role_permission rp
    WHERE rp.role_id = r.id
      AND rp.permission_id = p.id
  );
```

菜单新增后建议重新登录，刷新主应用菜单缓存。

## 7. 开发启动

启动主应用：

```powershell
cd .\jeecgboot-vue3
corepack pnpm dev --host 127.0.0.1 --port 3100
```

启动子应用：

```powershell
cd .\my-app
corepack pnpm dev
```

验证地址：

```text
http://127.0.0.1:3103
http://127.0.0.1:3100/my-app/dashboard
```

## 8. 验收清单

- 子应用独立运行正常。
- 主应用菜单点击后能加载子应用。
- 主应用内刷新 `/my-app/dashboard` 不出现“查看组件引用是否正确”。
- qiankun 模式下不显示子应用 header/menu。
- 子应用新增路由后，主应用菜单 URL 同步补全。
- 生产构建后，子应用资源从 `/micro-apps/my-app/` 加载。

