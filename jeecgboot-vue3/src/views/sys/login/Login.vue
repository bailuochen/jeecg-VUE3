<template>
  <div :class="prefixCls">
    <div class="login-tools" v-if="!sessionTimeout">
      <AppLocalePicker :showText="false" v-if="showLocale" />
      <AppDarkModeToggle />
    </div>

    <div class="login-shell">
      <section class="login-brand-panel">
        <AppLogo class="login-logo" :alwaysShowTitle="true" />
        <div class="login-copy">
          <p class="login-kicker">Micro Frontend Console</p>
          <h1>{{ title }}</h1>
          <p>{{ t('sys.login.signInDesc') }}</p>
        </div>
        <div class="login-metrics">
          <div>
            <strong>Qiankun</strong>
            <span>统一入口</span>
          </div>
          <div>
            <strong>RBAC</strong>
            <span>权限菜单</span>
          </div>
          <div>
            <strong>Vue 3</strong>
            <span>主应用壳</span>
          </div>
        </div>
      </section>

      <div class="login-form-panel">
        <div :class="`${prefixCls}-form`">
          <LoginForm />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { AppLogo } from '/@/components/Application';
  import { AppLocalePicker, AppDarkModeToggle } from '/@/components/Application';
  import LoginForm from './LoginForm.vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useLocaleStore } from '/@/store/modules/locale';
  import { useLoginState } from './useLogin';
  defineProps({
    sessionTimeout: {
      type: Boolean,
    },
  });

  const globSetting = useGlobSetting();
  const { prefixCls } = useDesign('login');
  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const showLocale = localeStore.getShowPicker;
  const title = computed(() => globSetting?.title ?? '');
  const { handleBackLogin } = useLoginState();
  handleBackLogin();
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-login';
  @logo-prefix-cls: ~'@{namespace}-app-logo';
  @countdown-prefix-cls: ~'@{namespace}-countdown-input';
  @dark-bg: #111827;

  html[data-theme='dark'] {
    .@{prefix-cls} {
      background-color: @dark-bg;

      .ant-input,
      .ant-input-password {
        background-color: #232a3b;
      }

      .ant-btn:not(.ant-btn-link):not(.ant-btn-primary) {
        border: 1px solid #4a5569;
      }

      &-form {
        background: transparent !important;
      }

      .app-iconify {
        color: #fff;
      }
    }

    input.fix-auto-fill,
    .fix-auto-fill input {
      -webkit-text-fill-color: #c9d1d9 !important;
      box-shadow: inherit !important;
    }
  }

  .@{prefix-cls} {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    overflow: hidden;
    background:
      radial-gradient(circle at 20% 20%, rgba(22, 119, 255, 0.16), transparent 28%),
      radial-gradient(circle at 78% 18%, rgba(0, 168, 112, 0.14), transparent 26%),
      linear-gradient(135deg, #f7fbff 0%, #eef4f8 48%, #f8fafc 100%);

    .login-tools {
      position: fixed;
      top: 20px;
      right: 24px;
      z-index: 2;
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .login-shell {
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(420px, 0.95fr);
      width: min(1120px, calc(100vw - 48px));
      min-height: 640px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.82);
      border: 1px solid rgba(15, 23, 42, 0.08);
      border-radius: 8px;
      box-shadow: 0 24px 80px rgba(15, 23, 42, 0.14);
      backdrop-filter: blur(16px);
    }

    .login-brand-panel {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 44px;
      color: #fff;
      background:
        linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(22, 119, 255, 0.8)),
        linear-gradient(45deg, #0f172a, #1677ff);
    }

    .login-logo {
      position: static;
      height: 40px;

      .@{logo-prefix-cls}__title {
        color: #fff;
      }
    }

    .login-copy {
      max-width: 500px;

      .login-kicker {
        margin-bottom: 18px;
        color: rgba(255, 255, 255, 0.68);
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0;
        text-transform: uppercase;
      }

      h1 {
        margin-bottom: 18px;
        color: #fff;
        font-size: 42px;
        font-weight: 700;
        line-height: 1.15;
      }

      p {
        color: rgba(255, 255, 255, 0.78);
        font-size: 16px;
        line-height: 1.8;
      }
    }

    .login-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;

      div {
        padding: 16px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.08);
      }

      strong,
      span {
        display: block;
      }

      strong {
        margin-bottom: 8px;
        color: #fff;
        font-size: 17px;
      }

      span {
        color: rgba(255, 255, 255, 0.66);
      }
    }

    .login-form-panel {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
    }

    &-form {
      width: 100%;
      max-width: 390px;
    }

    input:not([type='checkbox']) {
      min-width: 0;
    }

    @media (max-width: @screen-lg) {
      padding: 24px;

      .login-shell {
        grid-template-columns: 1fr;
        min-height: auto;
      }

      .login-brand-panel {
        gap: 40px;
        padding: 32px;
      }
    }

    @media (max-width: @screen-sm) {
      padding: 12px;

      .login-shell {
        width: 100%;
      }

      .login-brand-panel,
      .login-form-panel {
        padding: 24px;
      }

      .login-copy h1 {
        font-size: 30px;
      }

      .login-metrics {
        grid-template-columns: 1fr;
      }
    }
  }
</style>
