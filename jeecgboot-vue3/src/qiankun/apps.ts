export const containerId = 'qiankun-content';

const _apps: Recordable[] = [];

for (const key in import.meta.env) {
  if (key.includes('VITE_APP_SUB_')) {
    const name = key.split('VITE_APP_SUB_')[1];
    _apps.push({
      name,
      entry: import.meta.env[key],
      container: '#' + containerId,
      activeRule: `/${name}`,
    });
  }
}

export const apps = _apps;

export function isQiankunPath(path: string) {
  return apps.some((app) => {
    const prefix = typeof app.activeRule === 'string' ? app.activeRule : `/${app.name}`;
    return path === prefix || path.startsWith(`${prefix}/`);
  });
}

