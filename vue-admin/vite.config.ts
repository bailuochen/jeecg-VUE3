import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';

const appName = 'vue-admin';

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
