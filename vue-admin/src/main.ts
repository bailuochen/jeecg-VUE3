import { createApp, type App as VueApp } from 'vue';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import App from './App.vue';
import { createSubRouter } from './router';
import './style.css';

let app: VueApp<Element> | null = null;
let router: ReturnType<typeof createSubRouter> | null = null;

function getContainer(props?: any) {
  return props?.container?.querySelector('#app') || document.querySelector('#app');
}

function render(props?: any) {
  const isQiankun = qiankunWindow.__POWERED_BY_QIANKUN__;
  router = createSubRouter(isQiankun ? '/vue-admin' : import.meta.env.BASE_URL || '/');
  app = createApp(App, {
    mainAppData: props?.data || {},
    isQiankun,
  });
  app.use(router);
  app.mount(getContainer(props)!);
}

renderWithQiankun({
  bootstrap() {
    console.log('[vue-admin] bootstrap');
  },
  mount(props) {
    console.log('[vue-admin] mount', props);
    render(props);
  },
  update(props) {
    console.log('[vue-admin] update', props);
  },
  unmount() {
    if (app) {
      app.unmount();
      app = null;
    }
    router = null;
  },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}
