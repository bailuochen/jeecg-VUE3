<template>
  <main class="shell" :class="{ 'shell-embedded': isQiankun }">
    <aside v-if="!isQiankun" class="nav">
      <div class="brand">Jeecg App 1</div>
      <RouterLink to="/dashboard">工作台</RouterLink>
      <RouterLink to="/menus">菜单示例</RouterLink>
    </aside>
    <RouterView v-slot="{ Component }">
      <component :is="Component" :main-app-data="mainAppData" :is-qiankun="isQiankun" />
    </RouterView>
  </main>
</template>

<script setup lang="ts">
defineProps<{
  mainAppData?: Record<string, any>;
  isQiankun?: boolean;
}>();
</script>
