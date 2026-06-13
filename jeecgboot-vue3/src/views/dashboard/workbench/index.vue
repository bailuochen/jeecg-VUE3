<template>
  <PageWrapper title="首页工作台" content="统一负责登录、权限、菜单与 qiankun 子应用入口。">
    <div class="workbench-shell">
      <section class="hero-panel">
        <div>
          <p class="hero-kicker">Application Shell</p>
          <h2>自主开发平台工作台</h2>
          <p class="hero-desc">主应用保持轻量，只承载基础权限体系、菜单管理和子应用挂载能力。</p>
        </div>
        <a-space wrap>
          <a-button type="primary" @click="goMenu">
            <template #icon><Icon icon="ant-design:menu-outlined" /></template>
            菜单管理
          </a-button>
          <a-button @click="goRole">
            <template #icon><Icon icon="ant-design:safety-outlined" /></template>
            角色权限
          </a-button>
        </a-space>
      </section>

      <a-row :gutter="[16, 16]">
        <a-col v-for="item in shellItems" :key="item.title" :xs="24" :md="12" :xl="6">
          <a-card class="shell-card" :bordered="false">
            <div class="card-icon">
              <Icon :icon="item.icon" />
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </a-card>
        </a-col>
      </a-row>

      <a-card class="check-card" :bordered="false" title="接入检查">
        <a-list :data-source="checkItems">
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta :title="item.title" :description="item.desc">
                <template #avatar>
                  <a-tag color="green">已保留</a-tag>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </a-card>
    </div>
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { useRouter } from 'vue-router';
  import { PageWrapper } from '/@/components/Page';
  import { Icon } from '/@/components/Icon';

  const router = useRouter();

  const shellItems = [
    {
      title: '权限中心',
      desc: '保留用户、角色、部门和授权能力，作为所有子应用的统一身份入口。',
      icon: 'ant-design:safety-certificate-outlined',
    },
    {
      title: '菜单中心',
      desc: '通过菜单配置挂载 qiankun 子应用路由，主应用只负责导航和容器。',
      icon: 'ant-design:appstore-outlined',
    },
    {
      title: '子应用容器',
      desc: '支持按业务域拆分前端应用，主应用保持稳定、克制和可扩展。',
      icon: 'ant-design:deployment-unit-outlined',
    },
    {
      title: '部署基座',
      desc: '前端构建产物可通过 nginx 统一代理，便于本地演练和服务器发布。',
      icon: 'ant-design:cloud-server-outlined',
    },
  ];

  const checkItems = [
    {
      title: '认证与权限',
      desc: '登录态、Token、权限码和菜单加载仍沿用后端服务。',
    },
    {
      title: '菜单管理',
      desc: '系统菜单可继续配置主应用页面和 qiankun 子应用入口。',
    },
    {
      title: '子应用接入',
      desc: '新增子应用时按模板复制、修改应用名和入口地址即可接入。',
    },
  ];

  function goMenu() {
    router.push('/system/menu');
  }

  function goRole() {
    router.push('/system/role');
  }
</script>
<style lang="less" scoped>
  .workbench-shell {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .hero-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 28px;
    border: 1px solid @border-color-base;
    border-radius: 8px;
    background: @component-background;
  }

  .hero-kicker {
    margin-bottom: 8px;
    color: @primary-color;
    font-size: 13px;
    font-weight: 600;
  }

  .hero-panel h2 {
    margin: 0;
    font-size: 26px;
    font-weight: 700;
  }

  .hero-desc {
    max-width: 680px;
    margin: 10px 0 0;
    color: @text-color-secondary;
    font-size: 15px;
    line-height: 1.7;
  }

  .shell-card {
    height: 100%;
    border: 1px solid @border-color-base;
  }

  .card-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    margin-bottom: 16px;
    border-radius: 8px;
    color: @primary-color;
    background: fade(@primary-color, 10%);
    font-size: 22px;
  }

  .shell-card h3 {
    margin-bottom: 8px;
    font-size: 16px;
    font-weight: 600;
  }

  .shell-card p {
    min-height: 66px;
    margin: 0;
    color: @text-color-secondary;
    line-height: 1.7;
  }

  .check-card {
    border: 1px solid @border-color-base;
  }

  @media (max-width: 768px) {
    .hero-panel {
      align-items: flex-start;
      flex-direction: column;
      padding: 20px;
    }
  }
</style>
