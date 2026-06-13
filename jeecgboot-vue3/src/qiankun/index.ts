import { addGlobalUncaughtErrorHandler, registerMicroApps, runAfterFirstMounted, start } from 'qiankun';
import { apps, containerId } from './apps';
import { getProps, initGlState } from './state';
import { registerQiankunRouter } from './route';

registerQiankunRouter();

function filterApps() {
  return apps.map((item) => ({
    ...item,
    props: getProps(),
    activeRule: typeof item.activeRule === 'function' ? item.activeRule : genActiveRule(item.activeRule),
  }));
}

function genActiveRule(routerPrefix: string) {
  return (location: Location) => location.pathname.startsWith(routerPrefix);
}

let retryCount = 0;

function registerApps() {
  const container = document.querySelector('#' + containerId);
  if (!container) {
    if (retryCount < 60) {
      retryCount++;
      setTimeout(() => registerApps(), 300);
    }
  } else {
    retryCount = 0;
    registerAppsNow();
  }
}

(registerApps as any).containerId = containerId;

function registerAppsNow() {
  if ((window as any).qiankunStarted) {
    return;
  }
  (window as any).qiankunStarted = true;
  const microApps = filterApps();
  registerMicroApps(microApps, {
    beforeLoad: [(loadApp) => console.log('[qiankun] before load', loadApp)],
    beforeMount: [(mountApp) => console.log('[qiankun] before mount', mountApp)],
    afterMount: [(mountApp) => console.log('[qiankun] after mount', mountApp)],
    beforeUnmount: [(unloadApp) => console.log('[qiankun] before unmount', unloadApp)],
    afterUnmount: [(unloadApp) => console.log('[qiankun] after unmount', unloadApp)],
  });
  runAfterFirstMounted(() => console.log('[qiankun] first micro app mounted'));
  addGlobalUncaughtErrorHandler((event) => console.log('[qiankun] uncaught error', event));
  initGlState();
  start({});
}

export default registerApps;

