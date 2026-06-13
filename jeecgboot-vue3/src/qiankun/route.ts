import { router } from '@/router';
import { isQiankunPath } from './apps';

export const { registerQiankunRouter } = (function () {
  let registered = false;

  function registerQiankunRouter() {
    if (!router) {
      setTimeout(() => registerQiankunRouter(), 1);
    } else {
      registerQiankunRouterNow();
    }
  }

  function registerQiankunRouterNow() {
    if (registered) {
      return;
    }
    registered = true;
    router.beforeEach(async (to, from, next) => {
      const isQiankunRoute = isQiankunPath(to.path);
      if (isQiankunRoute) {
        to.meta.isQiankunRoute = true;
      } else {
        delete to.meta.isQiankunRoute;
      }
      next();
    });
  }

  return {
    registerQiankunRouter,
  };
})();

