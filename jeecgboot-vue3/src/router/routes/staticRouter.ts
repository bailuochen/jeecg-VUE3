import type { AppRouteRecordRaw } from '/@/router/types';
import { PageEnum } from '/@/enums/pageEnum';
import { LAYOUT } from '/@/router/constant';

export const staticRoutesList: AppRouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'DashboardStatic',
    component: LAYOUT,
    redirect: PageEnum.BASE_HOME,
    meta: {
      hideMenu: true,
      title: 'Dashboard',
    },
    children: [],
  },
];
