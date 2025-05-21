/**
 * Form Configuration System
 * 
 * This file defines the configuration structure for the form system.
 * 
 * ===== HR Properties (开发者自定义扩展属性) =====
 * HR properties are custom properties that start with the 'hr' prefix (e.g., hrCarBrand).
 * These properties can be added to both field and block configurations and are designed 
 * for developers to implement custom functionality in components.
 * 
 * Key features:
 * 1. Always begin with 'hr' prefix
 * 2. Can store any valid JSON value (strings, numbers, objects, arrays, etc.)
 * 3. Are preserved unmodified in the final JSON Schema
 * 4. Do not interfere with the standard form functionality
 * 5. Can be used by custom components to implement special features
 * 
 * Example uses:
 * - Custom component configuration: hrOptions: {sortable: true, filterable: true}
 * - Component behavior flags: hrAllowCopy: true
 * - Integration points: hrCallback: "handleFieldChange"
 * - Custom validation: hrValidation: {minVal: 0, maxVal: 100}
 * 
 * HR properties can be configured directly in code or through the UI using
 * the HR Properties section in the configuration drawer.
 */

// example 表单数据对象
export const formData = {
    form: {
        Block01: {
            name: '',
            phone: '',
            sex: '',
        },
        Block02: {
            repaymentType: '',
            pic: []
        }
    }
}

// 区块配置
const BlockCongfig = {
    canBeFolded: true, // Boolean 布尔值 默认true; 是否可以折叠配置
    hrBlockType: '0', // String 默认值 '0'; 区块类型 ['0': 普通区块, '1': 主要区块, 等]
    
    // 开发者可以添加更多hr前缀的自定义属性，用于区块级别的特殊功能
    // 例如：
    // hrLayout: 'horizontal', // 布局方式 （暂无先不考虑实现）
    // hrColSpan: 3, // 每行显示列数 （暂无先不考虑实现）
    // hrPermissions: ['edit', 'view'], // 权限控制 （暂无先不考虑实现）
    // hrDependsOn: ['BLOCK01'], // It depends on （暂无先不考虑实现）
    // hrVisible: { depends: 'field1', value: 'yes' }, // 条件显示 （暂无先不考虑实现）
}

// 字段基础配置
const baseConfig = {
    title: '', // String 字段标题
    type: 'string', // String|Number|Array 字段类型 [string: 字符串类型 | number: 数字类型 | Array: 数组类型(如上传组件)]
    emptyValue: '', // String 空值时的默认值
    required: false, // Boolean 是否必填
    requiredMessage: '', // String 必填校验提示信息 [默认值: 请输入/请选择+标题]
    disabled: false, // Boolean 是否禁用
    hidden: false, // Boolean 是否隐藏
    placeholder: '', // String 输入提示文本 [默认值: 请输入/请选择]
    
    // 开发者自定义扩展属性 (hr开头的任意属性)
    // hrXxx: 任意值类型(字符串、数字、对象、数组、null等)
    // 在Schema中会原样保留，组件开发者可利用这些属性实现个性化功能
    // 例如: hrCarBrand: {} 或 hrSettings: [] 或 hrConfig: "value" 等
    // 这些属性不会影响标准功能，仅供自定义组件使用
}
// 字符串输入控件配置对象属性
const inputTextConfig = {
    ...baseConfig,
    // [字符串输入控件] 拓展配置
    pattern: '', // String 正则表达式 验证规则
    patternMessage: '', // 正则表达式 验证提示
    maxLength: null, // Number, 无该配置则不生成不限制
}
// 数字输入控件配置对象
const inputNumberConfig = {
    ...baseConfig,
    // [数字输入控件] 拓展配置
    multipleOf: 0.0001, // number 默认值 0.0001
    widget: 'InputNumberWidget' // String 预配置自定义组件
}

// 简单选择控件
const SelectSimpleConfig = {
    ...baseConfig,
    // [简单选择] 拓展配置
    enum: [], // Array 枚举codes
    enums: [] // Array 枚举codeNames
}

// 远程获取选择控件
const SelectRemoteConfig = {
    ...baseConfig,
    // [远程获取选择] 拓展配置
    enumApi: 'queryDict',  // String, 前端项目接口函数名; 枚举字典 查询对象 将生成 配置对象数据 enum 和 enumNames ；
    enumApiParams: {
        //  * any 任何参数
    },
}
// 日期配置
const DatePickerConfig = {
    ...baseConfig,
    format: '', // String  无值次属性不存在, 只允许格式 "yyyy-MM-dd 默认
    widget: 'DatePickerWidget' // String 预配置自定义组件
}

// 省市区组件
const AreaConfig = {
    ...baseConfig,
    bindBlock: '', // string 绑定区块 transformSchema 方法识别此字段 
    bindCode: '', // String 绑定code   transformSchema 方法识别此 bindBlock 和 bindCode字段 存在时， 经由经由transformSchema 生成后 在生成jsonSchema对象时 必定会生成 两个配置字段  例如（houseLocationName， houseLocationCode）；  绑定的字段属性，必定时隐藏非必填；
    widget: 'AreaWidget',
}

// 上传控件 配置
const uploadWidgetConfig = {
    ...baseConfig,
    // [上传控件] 拓展配置
    maxCount: 50, // Number 最大数量
    maxSize: 20971520, // Number 文件大小
    fieldClass: {}, // Object  { string: Boolen } 自定义类名
    widget: 'uploadWidget' // String 预配置自定义组件
}
// 自定义组件
const widgetConfig = {
    ...baseConfig,
    // 自定义组件可以使用任意基础配置属性
    widget: 'CustomWidget', // String 指定自定义组件名称
    
    // 开发者可添加hr前缀的自定义扩展属性
    // 这些属性会直接传递给自定义组件实现特殊功能
    // 例如:
    // hrProps: { max: 100, features: ['search', 'filter'] },
    // hrCallback: "handleChange",
    // hrDataSource: "remote",
    // hrOptions: [{ label: '选项1', value: 1 }, { label: '选项2', value: 2 }]
}

// 表单配置对象
export const formConfig = {
    config: {
        title: "表单", // [非必填]
        BLOCK01: { //  [必填] 编码code
            title: "", // [非必填]
            properties: {
                id: {  // [必填] 编码code
                    title: 'id',  // [非必填]
                    type: 'string', // [必填]
                    emptyValue: '', // [非必填]
                    required: true, // [必填]
                    requiredMessage: '请输入id', //[非必填: 默认值 请输入 | 请选择]
                    disabled: false, // [非必填]
                    hidden: false, // [非必填]
                    placeholder: '请输入', // [非必填 请输入 | 请选择 ]控件提示 默认值：enumDict 有值则 为： 请选择, 无值则 为：请输入
                    widget: '' // [非必填] 自定义组件 不填默认vue-form组件 处理为输入框（无需逻辑声明处理）
                    // ...any hrAnyCode 开发者使用
                },
                name: {
                    title: '姓名', //  [非必填]
                    type: 'string', // [必填]
                    emptyValue: '', // [非必填]
                    required: true, // [必填]
                    requiredMessage: '请输入姓名', //[非必填: 默认值 请输入 | 请选择]
                    disabled: false, // [非必填]
                    hidden: false, // 是否隐藏 [非必填 请输入 | 请选择 ]控件提示 默认值：enumDict 有值则 为： 请选择, 无值则 为：请输入
                    widget: '' // 自定义组件 不填默认vue-form组件 处理为输入框（无需逻辑声明处理）
                    // ...any hrAnyCode 开发者使用
                },
                sex: {
                    title: '性别',  // [非必填]
                    type: 'string', // [必填]   
                    emptyValue: '', // [非必填]
                    required: true, // [必填]
                    requiredMessage: '请选择姓别', // [非必填: 默认值 请输入 | 请选择]
                    enumDict: 'sexDict',  // 枚举字典 查询对象 将生成 配置对象数据 enum 和 enumNames ；当该配置属性存在值时 vue-form组件 将生成 选择器组件
                    disabled: false, // [非必填]    
                    hidden: false, // [非必填]  是否隐藏配置
                    placeholder: '请输入', //  [非必填 请输入 | 请选择 ]控件提示 默认值：enumDict 有值则 为： 请选择, 无值则 为：请输入
                    widget: '' // 自定义组件 不填默认vue-form组件 处理为输入框（无需逻辑声明处理）
                    // ...any hrAnyCode 开发者使用
                },
                phone: {
                    title: '手机号',  // [非必填]
                    type: 'string',  // [必填]   
                    emptyValue: '',  // [非必填]
                    required: true, // [必填]
                    requiredMessage: '请输入姓名', // [非必填: 默认值 请输入 | 请选择]
                    disabled: false, // [非必填]    
                    hidden: false,// [非必填]  是否隐藏配置
                    placeholder: '请输入', // [非必填]  控件提示 默认值：enumDict 有值则 为： 请选择, 无值则 为：请输入
                    pattern: '1[0-9]{10}$', // [非必填]  正则表达式 验证规则
                    patternMessage: '请输入正确的手机号', // 正则表达式 验证提示
                    maxLength: 11, // [非必填]  最大长度, 无该配置则不生成不限制
                    hrAnyCode: '', // 任意code 开发者使用
                },
                houseLocationName: {
                    title: '省市区',  // [非必填]
                    type: 'string', // [必填]   
                    emptyValue: '', // [非必填]
                    required: true,  // [非必填: 默认值  请选择]
                    requiredMessage: '请选择省市区', // [非必填: 默认值  请选择]
                    bindBlock: 'BLOCK01', // [非必填]  绑定区块code 默认值为当前区块位置
                    bindCode: 'houseLocationCode', // [必填]  绑定code  值任意
                    disabled: false, // [非必填]        
                    hidden: false, // [非必填]  是否隐藏配置
                    placeholder: '请输入', // [非必填]  控件提示 默认值：enumDict 有值则 为： 请选择, 无值则 为：请输入
                    widget: 'AreaWidget',
                    // ...any hrAnyCode 开发者使用
                },
                houseLocationCode: {
                    title: '省市区',  // [非必填]
                    type: 'string', // [必填]   
                    emptyValue: '', // [非必填]
                    required: false,  // [非必填: 默认值  请选择] 
                    requiredMessage: '请选择省市区', // [非必填: 默认值  请选择]
                    bindBlock: 'BLOCK01', // [非必填]  绑定区块code 默认值为当前区块位置
                    bindCode: 'houseLocationName', // [必填]  绑定code  值任意
                    disabled: false, // [非必填]        
                    hidden: true, // [非必填]  是否隐藏配置， 隐藏时 该字段 必定是非必填的
                    // ...any hrAnyCode 开发者使用
                },

            },
            canBeFolded: true, // 是否可以折叠配置
            hrBlockType: '0' // 区块类型
        },
        BLOCK02: {
            title: "",
            properties: {
                repaymentType: {
                    title: '还款方式',
                    type: 'string',
                    emptyValue: '',
                    required: true,
                    requiredMessage: '请选择姓别',
                    enumApi: 'queryDict',  // 枚举字典 查询对象 将生成 配置对象数据 enum 和 enumNames ；当该配置属性存在值时 vue-form组件 将生成 选择器组件
                    enumApiParams: {
                        id: 'id', // 表单内部数据 响应式数据
                        dictCode: 'repaymentDict', // 字典编码
                    }, // 枚举字典 查询对象 参数
                    disabled: false,
                    hidden: false, // 是否隐藏配置
                    placeholder: '请输入', // 控件提示 默认值：enumDict 有值则 为： 请选择, 无值则 为：请输入
                    widget: '' // 自定义组件 不填默认vue-form组件 处理为输入框（无需逻辑声明处理）
                },
                pic: {
                    title: '图片',
                    type: 'Array',
                    emptyValue: '',
                    required: false,
                    requiredMessage: '请上传图片',
                    widget: 'uploadWidget',
                    fileTypes: 'jpeg,jpg,webp,png,pdf',
                    maxSize: 20971520,
                    maxCount: 50,
                }
            },
            canBeFolded: true, // 是否可以折叠配置
            hrBlockType: '0' // 区块类型
        }
    }
}

// 通过功能逻辑代码生成 表单配置数据 ; 必须以次数据格式返回 vue-form 组件才能渲染 
// 注意：所有以 hr 开头的自定义属性都会被原样保留在schema对象中
export const jsonSchema = {
    "title": "表单",
    "type": "object",
    "required": [],
    "properties": {
        "BLOCK01": {
            "title": "",
            "required": [
                "name",
                "sex"
            ],
            "properties": {
                "name": {
                    "type": "string",
                    "title": "姓名",
                    "ui:emptyValue": "",
                    "ui:options": {
                        "disabled": false,
                        "placeholder": "请输入"
                    },
                    "extProperties": {},
                    "err:required": "必须输入姓名"
                },
                "sex": {
                    "type": "string",
                    "title": "性别",
                    "ui:emptyValue": "",
                    "uniqueItems": false,
                    "enum": [
                        "2",
                        "1"
                    ],
                    "enumNames": [
                        "女",
                        "男"
                    ],
                    "ui:options": {
                        "disabled": false,
                        "clearable": true,
                        "placeholder": "请选择"
                    },
                    "extProperties": {},
                    "err:required": "必须输入性别"
                },
                "phone": {
                    "type": "string",
                    "title": "联系人手机",
                    "ui:emptyValue": "",
                    "ui:hidden": false,
                    "ui:options": {
                        "disabled": false,
                        "placeholder": "请输入",
                        "pattern": "1[0-9]{10}$",
                        "err:pattern": "请输入正确的手机号",
                        "maxLength": 11
                    },
                    "extProperties": {},
                    "err:required": "必须输入联系人手机",
                    "hrAnyCode": ""
                },
                "houseLocationName": {
                    "type": "string",
                    "title": "房屋地址（省市区）",
                    "maxLength": 70,
                    "ui:emptyValue": "",
                    "ui:hidden": true,
                    "ui:options": {
                        "disabled": false
                    },
                    "bindBlock": "BLOCK01",
                    "bindCode": "houseLocationCode",
                    "extProperties": {},
                    "ui:widget": "AreaWidget"
                },
                "houseLocationCode": {
                    "type": "string",
                    "title": "房屋地址（省市区）Code",
                    "ui:emptyValue": "",
                    "ui:hidden": true,
                    "ui:options": {
                        "disabled": false
                    },
                    "bindBlock": "BLOCK01",
                    "bindCode": "houseLocationName",
                    "extProperties": {}
                }
            }
        },
        "BLOCK02": {
            "title": "",
            "required": [],
            "properties": {
                "repaymentType": {
                    "type": "string",
                    "title": "还款方式",
                    "ui:emptyValue": "",
                    "uniqueItems": false,
                    "ui:options": {
                        "disabled": false,
                        "clearable": true,
                        "placeholder": "请输入"
                    },
                    "enum": [
                        "8",
                        "2",
                        "1"
                    ],
                    "enumNames": [
                        "本金不定额（银行限定）、利息按期",
                        "本金按期等额、利息首期收取",
                        "本金和利息按期等额收取"
                    ],
                    "extProperties": {},
                    "err:required": "必须输入还款方式"
                },
                "pic": {
                    "type": "array",
                    "title": "图片",
                    "ui:emptyValue": [],
                    "minItems": 0,
                    "maxItems": 50,
                    "items": {
                        "type": "object"
                    },
                    "ui:options": {
                        "disabled": false,
                        "fieldClass": {
                            "diy_class_clx": true
                        },
                        "maxCount": 50,
                        "maxSize": 20971520,
                        "fileTypes": "jpeg,jpg,webp,png,pdf"
                    },
                    "extProperties": {},
                    "ui:widget": "uploadWidget"
                }
            }
        }
    },
    "ui:options": {
        "canBeFolded": true,
        "hrBlockType": "0"
    }
};
