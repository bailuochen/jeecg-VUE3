import { ref, reactive, nextTick } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { getDictItemsByCode } from '/@/utils/dict/index';
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '/@/store/modules/app';
import { useTabs } from '/@/hooks/web/useTabs';
import { useModal } from '/@/components/Modal';
import {useMessage} from "/@/hooks/web/useMessage";

/**
 * 列表接口
 * @param params
 */
const queryMessageList = (params) => {
  const url = '/sys/annountCement/vue3List';
  return defHttp.get({ url, params });
};

/**
 * 获取消息列表数据
 *
 * setLocaleText 设置未读消息
 */
export function useSysMessage(setLocaleText) {
  const { createMessage } = useMessage();
  const rangeDateArray = getDictItemsByCode('rangeDate');
  console.log('+++++++++++++++++++++');
  console.log('rangeDateArray', rangeDateArray);
  console.log('+++++++++++++++++++++');

  const messageList = ref<any[]>([]);
  const pageNo = ref(1)
  let pageSize = 10;

  const searchParams = reactive({
    fromUser: '',
    rangeDateKey: '',
    rangeDate: [],
    starFlag: '',
    noticeType: ''
  });


  function getQueryParams() {
    let { fromUser, rangeDateKey, rangeDate, starFlag, noticeType } = searchParams;
    let params = {
      fromUser,
      starFlag,
      rangeDateKey,
      beginDate: '',
      endDate: '',
      pageNo: pageNo.value,
      pageSize,
      noticeType
    };
    if (rangeDateKey == 'zdy') {
      params.beginDate = rangeDate[0]+' 00:00:00';
      params.endDate = rangeDate[1]+' 23:59:59';
    }
    return params;
  }

  // 数据是否加载完了
  const loadEndStatus = ref(false);

  //请求数据
  async function loadData() {
    if(loadEndStatus.value === true){
      return;
    }
    let params = getQueryParams();
    const data = await queryMessageList(params);
    console.log('获取结果', data);
    if(!data || data.length<=0){
      loadEndStatus.value = true;
      setLocaleText();
      return;
    }
    if(data.length<pageSize){
      loadEndStatus.value = true;
    }
    pageNo.value = pageNo.value+1
    let temp:any[] = messageList.value;
    temp.push(...data);
    messageList.value = temp;
    setLocaleText();
  }

  //重置
  function reset(){
    messageList.value = []
    pageNo.value = 1;
    loadEndStatus.value = false;
  }

  //标星
  async function updateStarMessage(item){
    const url = '/sys/sysAnnouncementSend/edit';
    let starFlag = '1';
    if(item.starFlag==starFlag){
      starFlag = '0'
    }
    const params = {
      starFlag,
      id: item.sendId
    }
    // 代码逻辑说明: QQYUN-4491【应用】一些小问题  4、标星不需要提示吧
    const data:any = await defHttp.put({url, params}, {isTransformResponse: false});
    if(data.success === true){
    }else{
      createMessage.warning(data.message)
    }
  }


  const loadingMoreStatus = ref(false);
  async function onLoadMore() {
    loadingMoreStatus.value = true;
    await loadData();
    loadingMoreStatus.value = false;
  }

  function noRead(item) {
    if (item.readFlag === '1') {
      return false;
    }
    return true;
  }

  // 消息类型
  function getMsgCategory(item) {
    if(item.busType=='email'){
      return '邮件提醒:';
    } else if(item.busType=='bpm'){
      return '流程催办:';
    } else if(item.busType=='bpm_cc'){
      return '流程抄送:';
    }else if(item.busType=='bpm_task'){
      return '流程任务:';
    } else if (item.busType == 'eoa_co_remind') {
      return '协同催办:';
    } else if (item.busType == 'eoa_co_notify') {
      return '协同提醒:';
    } else if (item.busType == 'eoa_sup_remind') {
      return '督办催办:';
    } else if (item.busType == 'eoa_sup_notify') {
      return '督办提醒:';
    } else if (item.msgCategory == '2') {
      return '系统消息:';
    } else if (item.msgCategory == '1') {
      return '通知公告:';
    }
    return '';
  }

  // QQYUN-4472 来消息了没有提醒--查看详情改为去处理
  function getHrefText(item) {
    if(item.busType === 'bpm'|| item.busType === 'bpm_task' || item.busType === 'tenant_invite'){
      //判断是否是查看详情
      if (item.msgAbstract) {
        try {
          const json = JSON.parse(item.msgAbstract);
          if (json.taskDetail) {
            return '查看详情';
          }
        } catch (e) {
          console.error('getHrefText:msgAbstract参数不是JSON格式', item.msgAbstract);
        }
      }
      return '去处理'
    } else if (['eoa_co_notify', 'eoa_co_remind', 'eoa_sup_notify', 'eoa_sup_remind'].includes(item.busType)) {
      // 代码逻辑说明: 【JHHB-133】消息列表打开协同工作
      return '去处理';
    } else {
      return '查看详情'
    }
  }

  return {
    messageList,
    reset,
    loadData,
    loadEndStatus,
    searchParams,
    updateStarMessage,
    onLoadMore,
    noRead,
    getMsgCategory,
    getHrefText

  };
}

/**
 * 用于消息跳转
 */
export function useMessageHref(emit, props) {
  let messageHrefArray: any[] = getDictItemsByCode('messageHref');
  messageHrefArray = [
    ...messageHrefArray,
    { value: 'eoa_co_remind', text: '/collaboration/pending', url: '/collaboration/launch' },
    { value: 'eoa_co_notify', text: '/collaboration/pending', url: '/collaboration/launch' },
    { value: 'eoa_sup_notify', text: '/superviser/pending' },
    { value: 'eoa_sup_remind', text: '/superviser/pending' },
  ];
  const router = useRouter();
  const appStore = useAppStore();
  const rt = useRoute();
  const { close: closeTab, closeSameRoute } = useTabs();

  const currentModal = ref<string | null>(null);
  const modalParams = ref<Recordable>({});
  const modalRegCache = ref<Recordable>({});
  const bindParams = ref<Recordable>({});

  async function handleOpenType(type, params) {
    currentModal.value = null;
    modalParams.value = { ...params };
    switch (type) {
      case 'task':
        bindParams.value = { actionType: 'todo' };
        currentModal.value = 'ProcessTaskHandleModal';
        break;
      case 'history':
        bindParams.value = {};
        currentModal.value = 'MyTaskHandleModal';
        break;
      default:
        currentModal.value = null;
        break;
    }
    initModalRegister();
    await nextTick(() => {
      if (modalRegCache.value[currentModal.value!]?.isRegister) {
        modalRegCache.value[currentModal.value!].modalMethods.openModal(true, modalParams.value);
      }
    });
  }

  function initModalRegister() {
    if (!currentModal.value) {
      return;
    }
    if (!modalRegCache.value[currentModal.value]) {
      const [registerModal, modalMethods] = useModal();
      modalRegCache.value[currentModal.value] = {
        isRegister: false,
        register: bindRegisterModal(registerModal, modalMethods),
        modalMethods,
      };
    }
  }

  function bindRegisterModal(regFn, modalMethod) {
    return async (...args) => {
      await regFn(...args);
      modalMethod.openModal(true, modalParams.value);
      modalRegCache.value[currentModal.value!].isRegister = true;
    };
  }

  async function goPage(record, openModalFun?) {
    if (!record.busType || record.busType === 'msg_node') {
      if (openModalFun) {
        openModalFun();
      } else {
        emit('detail', record);
      }
      return;
    }
    if (record.busType === 'comment') {
      openModalFun && openModalFun();
      return;
    }
    if (record.busType === 'tenant_invite') {
      await router.push({ name: 'system-usersetting', query: { page: 'tenantSetting' } });
      return;
    }
    await goPageWithBusType(record);
  }

  function isFormComment(record) {
    return false;
  }

  async function goPageWithBusType(record) {
    const { busType, busId, msgAbstract } = record;
    const temp = messageHrefArray.filter((item) => item.value === busType);
    if (!temp || temp.length === 0) {
      console.error('当前业务类型不识别', busType);
      return;
    }
    let path = temp[0].text;
    if (['eoa_co_notify', 'eoa_co_remind'].includes(busType)) {
      if (busId.startsWith('coId-')) {
        path = temp[0].url;
      } else if (busId.startsWith('nodeId-')) {
        path = temp[0].text;
      }
    }
    path = path.replace('{DETAIL_ID}', busId);
    const query: any = { detailId: busId };
    if (msgAbstract) {
      try {
        const json = JSON.parse(msgAbstract);
        Object.keys(json).forEach((key) => {
          query[key] = json[key];
        });
      } catch (e) {
        console.error('msgAbstract参数不是JSON格式', msgAbstract);
      }
    }
    if (query.taskDetail) {
      await showHistory(query.procInsId, { taskOriginalId: query.taskId, busType, id: busId, readFlag: record.readFlag });
    } else {
      appStore.setMessageHrefParams(query);
      if (rt.path.indexOf(path) >= 0) {
        await closeTab();
        await router.replace({ path, query: { time: new Date().getTime() } });
      } else {
        closeSameRoute(path);
        await router.push({ path });
      }
    }
  }

  async function showHistory(processInstanceId, data?) {
    const { formData, formUrl } = await getTaskInfoForHistory({ processInstanceId });
    formData['PROCESS_TAB_TYPE'] = 'history';
    handleOpenType('history', {
      formData,
      formUrl,
      isCc: data && data.busType === 'bpm_cc',
      record: data,
      title: '流程历史',
    });
  }

  const nodeInfoUrl = '/act/process/extActProcessNode/getHisProcessNodeInfo';
  const taskNodeInfo = (params) => defHttp.get({ url: nodeInfoUrl, params });

  async function getTaskInfoForHistory(record) {
    const params = { procInstId: record.processInstanceId };
    const result = await taskNodeInfo(params);
    const formData: any = {
      dataId: result.dataId,
      taskId: record.id,
      taskDefKey: record.taskId,
      procInsId: record.processInstanceId,
      tableName: result.tableName,
      vars: result.records,
    };
    let tempFormUrl = result.formUrl;
    if (tempFormUrl && tempFormUrl.indexOf('?') !== -1 && !isURL(tempFormUrl) && tempFormUrl.indexOf('{{DOMAIN_URL}}') === -1) {
      tempFormUrl = result.formUrl.split('?')[0];
      formData.extendUrlParams = getQueryVariable(result.formUrl);
    }
    return {
      formData,
      formUrl: tempFormUrl,
    };
  }

  function getQueryVariable(url) {
    if (!url) return;
    const query = url.split('?')[1];
    const result = {};
    query.split('&').forEach((item) => {
      const index = item.indexOf('=');
      if (index !== -1) {
        result[item.substr(0, index)] = item.substr(index + 1);
      }
    });
    return result;
  }

  function isURL(s) {
    return /^http[s]?:\/\/.*/.test(s);
  }

  return {
    goPage,
    isFormComment,
    modalRegCache,
    currentModal,
    bindParams,
  };
}