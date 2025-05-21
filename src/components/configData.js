/**
 * 表单配置数据定义模块
 * 定义了各种表单控件的默认配置
 */

// 区块配置 - 定义表单区块的基本属性
export const BlockConfig = {
  title: '默认区块',
  canBeFolded: true, // 是否可折叠
  hrBlockType: 'normal' // 区块类型：normal, primary, success, warning, danger
};

// 文本输入框配置
const inputTextConfig = {
  title: '', // 字段标题
  type: 'string', // 数据类型
  emptyValue: '', // 空值
  required: false, // 是否必填
  requiredMessage: '请输入', // 必填提示
  disabled: false, // 是否禁用
  hidden: false, // 是否隐藏
  placeholder: '请输入', // 占位提示
  pattern: '', // 验证正则
  patternMessage: '', // 验证提示
  maxLength: null // 最大长度
};

// 数字输入框配置
const inputNumberConfig = {
  title: '',
  type: 'number',
  emptyValue: '',
  required: false,
  requiredMessage: '请输入',
  disabled: false,
  hidden: false,
  placeholder: '请输入',
  min: null,
  max: null,
  step: 1,
  precision: 0
};

// 简单选择器配置
const selectSimpleConfig = {
  title: '',
  type: 'string',
  emptyValue: '',
  required: false,
  requiredMessage: '请选择',
  disabled: false,
  hidden: false,
  placeholder: '请选择',
  enumDict: '',
  allowClear: true,
  mode: 'single'
};

// 远程选择器配置
const selectRemoteConfig = {
  title: '',
  type: 'string',
  emptyValue: '',
  required: false,
  requiredMessage: '请选择',
  disabled: false,
  hidden: false,
  placeholder: '请选择',
  enumApi: 'queryDict',
  enumApiParams: {
    dictCode: ''
  },
  allowClear: true,
  mode: 'single'
};

// 日期选择器配置
const datePickerConfig = {
  title: '',
  type: 'string',
  emptyValue: '',
  required: false,
  requiredMessage: '请选择',
  disabled: false,
  hidden: false,
  placeholder: '请选择',
  format: 'yyyy-MM-dd',
  showTime: false,
  disablePast: false,
  disableFuture: false,
  widget: 'DatePickerWidget'
};

// 省市区选择器配置
const areaSelectorConfig = {
  title: '省市区',
  type: 'string',
  emptyValue: '',
  required: false,
  requiredMessage: '请选择省市区',
  disabled: false,
  hidden: false,
  placeholder: '请选择',
  bindBlock: '',
  bindCode: '',
  widget: 'AreaWidget'
};

// 上传组件配置
const uploadConfig = {
  title: '',
  type: 'Array',
  emptyValue: [],
  required: false,
  requiredMessage: '请上传',
  disabled: false,
  hidden: false,
  placeholder: '请上传',
  maxCount: 50,
  maxSize: 20971520,
  fileTypes: 'jpeg,jpg,png,pdf',
  buttonText: '点击上传',
  widget: 'uploadWidget'
};

/**
 * 根据组件类型获取对应的配置
 * @param {string} type - 组件类型
 * @returns {Object} 组件配置对象
 */
export function getConfigByType(type) {
  const configMap = {
    inputText: inputTextConfig,
    inputNumber: inputNumberConfig,
    selectSimple: selectSimpleConfig,
    selectRemote: selectRemoteConfig,
    datePicker: datePickerConfig,
    areaSelector: areaSelectorConfig,
    upload: uploadConfig
  };
  return configMap[type] || {};
}

export default {
  BlockConfig,
  getConfigByType
};