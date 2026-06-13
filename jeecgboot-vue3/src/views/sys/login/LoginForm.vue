<template>
  <div class="login-card-title enter-x" v-show="getShow">
    <h2>{{ t('sys.login.signInFormTitle') }}</h2>
    <p>请输入账号、密码和验证码进入平台</p>
  </div>
  <Form class="login-account-form enter-x" :model="formData" :rules="getFormRules" ref="formRef" v-show="getShow" @keypress.enter="handleLogin">
    <FormItem name="account" class="enter-x">
      <Input size="large" v-model:value="formData.account" :placeholder="t('sys.login.userName')" class="fix-auto-fill" />
    </FormItem>
    <FormItem name="password" class="enter-x">
      <InputPassword size="large" visibilityToggle v-model:value="formData.password" :placeholder="t('sys.login.password')" />
    </FormItem>

    <ARow class="login-captcha-row enter-x" :gutter="12">
      <ACol :span="15">
        <FormItem name="inputCode" class="enter-x">
          <Input size="large" v-model:value="formData.inputCode" :placeholder="t('sys.login.inputCode')" />
        </FormItem>
      </ACol>
      <ACol :span="9">
        <FormItem class="enter-x">
          <img
            v-if="randCodeData.requestCodeSuccess"
            class="login-captcha-img"
            :src="randCodeData.randCodeImage"
            @click="handleChangeCheckCode"
          />
          <img v-else class="login-captcha-img" src="../../../assets/images/checkcode.png" @click="handleChangeCheckCode" />
        </FormItem>
      </ACol>
    </ARow>

    <FormItem class="enter-x">
      <Button class="login-submit-btn" type="primary" size="large" block @click="handleLogin" :loading="loading">
        {{ t('sys.login.loginButton') }}
      </Button>
    </FormItem>
  </Form>
</template>
<script lang="ts" setup>
  import { reactive, ref, toRaw, unref, computed, onMounted } from 'vue';

  import { Form, Input, Row, Col, Button } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';

  import { useUserStore } from '/@/store/modules/user';
  import { LoginStateEnum, useLoginState, useFormRules, useFormValid } from './useLogin';
  import { getCodeInfo } from '/@/api/sys/user';
  import {  encryptAESCBC } from '/@/utils/cipher';

  const ACol = Col;
  const ARow = Row;
  const FormItem = Form.Item;
  const InputPassword = Input.Password;
  const { t } = useI18n();
  const { notification } = useMessage();
  const userStore = useUserStore();

  const { getLoginState } = useLoginState();
  const { getFormRules } = useFormRules();

  const formRef = ref();
  const loading = ref(false);

  const formData = reactive({
    account: 'admin',
    password: '123456',
    inputCode: '',
  });
  const randCodeData = reactive({
    randCodeImage: '',
    requestCodeSuccess: false,
    checkKey: null,
  });

  const { validForm } = useFormValid(formRef);

  //onKeyStroke('Enter', handleLogin);

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN);

  async function handleLogin() {
    const data = await validForm();
    if (!data) return;
    try {
      loading.value = true;

      // 密码使用AES加密传输
      const encryptedPassword = encryptAESCBC(data.password);
      const { userInfo } = await userStore.login(
        toRaw({
          password: encryptedPassword,
          username: data.account,
          captcha: data.inputCode,
          checkKey: randCodeData.checkKey,
          mode: 'none', //不要默认的错误提示
        })
      );
      if (userInfo) {
        notification.success({
          message: t('sys.login.loginSuccessTitle'),
          description: `${t('sys.login.loginSuccessDesc')}: ${userInfo.realname}`,
          duration: 3,
        });
      }
    } catch (error) {
      notification.error({
        message: t('sys.api.errorTip'),
        description: error.message || t('sys.api.networkExceptionMsg'),
        duration: 3,
      });
      loading.value = false;
      handleChangeCheckCode();
    }
  }
  function handleChangeCheckCode() {
    formData.inputCode = '';
    // 代码逻辑说明: [QQYUN-10775]验证码可以复用 #7674------------
    randCodeData.checkKey = new Date().getTime() + Math.random().toString(36).slice(-4); // 1629428467008;
    getCodeInfo(randCodeData.checkKey).then((res) => {
      randCodeData.randCodeImage = res;
      randCodeData.requestCodeSuccess = true;
    });
  }

  //初始化验证码
  onMounted(() => {
    handleChangeCheckCode();
  });
</script>
<style lang="less" scoped>
  .login-card-title {
    margin-bottom: 28px;

    h2 {
      margin-bottom: 8px;
      color: #0f172a;
      font-size: 28px;
      font-weight: 700;
      line-height: 1.25;
    }

    p {
      margin: 0;
      color: #64748b;
      font-size: 14px;
    }
  }

  .login-account-form {
    :deep(.ant-input),
    :deep(.ant-input-password) {
      height: 44px;
      border-radius: 6px;
    }

    :deep(.ant-form-item) {
      margin-bottom: 20px;
    }
  }

  .login-captcha-row {
    align-items: flex-start;
  }

  .login-captcha-img {
    width: 100%;
    height: 44px;
    object-fit: cover;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
  }

  .login-submit-btn {
    height: 44px;
    border-radius: 6px;
    font-weight: 600;
  }
</style>
