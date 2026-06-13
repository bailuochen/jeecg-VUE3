import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from './views/Dashboard.vue';
import MenuDemo from './views/MenuDemo.vue';

export function createSubRouter(base: string) {
  return createRouter({
    history: createWebHistory(base),
    routes: [
      {
        path: '/',
        redirect: '/dashboard',
      },
      {
        path: '/dashboard',
        name: 'SubDashboard',
        component: Dashboard,
      },
      {
        path: '/menus',
        name: 'SubMenus',
        component: MenuDemo,
      },
    ],
  });
}
