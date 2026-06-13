<template>
  <section class="sub-page">
    <header v-if="!isQiankun" class="page-head">
      <div>
        <p class="eyebrow">菜单路由</p>
        <h1>子应用菜单示例</h1>
      </div>
      <button class="ghost-button" type="button">刷新数据</button>
    </header>

    <section class="panel">
      <table class="menu-table">
        <thead>
          <tr>
            <th>菜单名</th>
            <th>路由</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.path">
            <td>{{ row.name }}</td>
            <td><code>{{ row.path }}</code></td>
            <td><span class="tag">已配置</span></td>
          </tr>
        </tbody>
      </table>
    </section>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  isQiankun?: boolean;
}>();

const rows = [
  { name: '微前端工作台', path: '/jeecg-app-1/dashboard' },
  { name: '子应用菜单示例', path: '/jeecg-app-1/menus' },
];
</script>
