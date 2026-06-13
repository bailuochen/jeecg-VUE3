import { initGlobalState } from 'qiankun';
import { store } from '/@/store';
import { router } from '/@/router';
import { getToken } from '/@/utils/auth';

export function getProps() {
  return {
    data: {
      publicPath: '/',
      token: getToken(),
      store,
      router,
    },
  };
}

export function initGlState(info = { userName: 'admin' }) {
  const actions = initGlobalState(info);
  actions.setGlobalState(info);
  actions.onGlobalStateChange((newState, prev) => {
    console.info('qiankun global state changed', newState, prev);
  });
}
