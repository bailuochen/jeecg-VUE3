<template>
  <section class="sub-page">
    <header v-if="!isQiankun" class="hero">
      <div>
        <p class="eyebrow">Qiankun 子应用</p>
        <h1>微前端工作台</h1>
        <p class="summary">这是运行在 JeecgBoot 主应用菜单里的 vue-admin 子应用。</p>
      </div>
      <div class="status">Mounted</div>
    </header>

    <div class="metric-grid">
      <article v-for="item in metrics" :key="item.label" class="metric">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.note }}</small>
      </article>
    </div>

    <section class="panel">
      <h2>主应用传入信息</h2>
      <div class="info-grid">
        <span>Token</span>
        <code>{{ tokenText }}</code>
        <span>Public Path</span>
        <code>{{ mainAppData.publicPath || '/' }}</code>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  mainAppData?: Record<string, any>;
  isQiankun?: boolean;
}>();

const mainAppData = computed(() => props.mainAppData || {});
const isQiankun = computed(() => Boolean(props.isQiankun));
const tokenText = computed(() => (mainAppData.value.token ? `${String(mainAppData.value.token).slice(0, 12)}...` : '未传入'));

const metrics = [
  { label: 'Vue', value: '3.5.27', note: '与主应用解析版本一致' },
  { label: 'Vite', value: '6.4.1', note: '开发服务端口 3102' },
  { label: 'Routes', value: '2', note: '工作台 / 菜单示例' },
];
</script>
