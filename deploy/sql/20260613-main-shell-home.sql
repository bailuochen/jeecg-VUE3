-- Align the main frontend shell with qiankun sub-application entry routes.
-- Run this after importing the base JeecgBoot database and after inserting
-- the vue-admin micro-frontend menu records.

UPDATE sys_role_index
SET url = '/vue-admin/dashboard',
    component = 'LayoutsContent',
    is_route = 1,
    status = 0,
    update_time = NOW(),
    update_by = 'deploy'
WHERE role_code = 'DEF_INDEX_ALL';

UPDATE sys_permission
SET del_flag = 1,
    update_time = NOW(),
    update_by = 'deploy'
WHERE del_flag = 0
  AND (
    url LIKE '/dashboard%'
    OR url LIKE '/dataVisual%'
    OR url LIKE '/airag%'
    OR url LIKE '/online%'
    OR url LIKE '/report%'
  );
