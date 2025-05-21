// 输出jsonSchema 数据
// 支持同步和异步处理方式，处理嵌套字典数据和API调用
/**
 * transformSchema.js
 * 
 * 本模块负责将表单配置对象(formConfig)转换为JSON Schema，支持以下特性：
 * 1. 处理基本字段类型（字符串、数字、数组等）
 * 2. 自动处理带有 bindBlock 和 bindCode 属性的字段，生成关联的隐藏字段
 * 3. 支持异步数据加载（字典和API）
 * 4. 特殊处理省市区选择器等自定义组件
 * 
 * 主要导出函数：
 * - renderJsonSchemaAsync: 异步版本，支持从API和字典加载枚举数据
 */

import { loadApiModule, loadConstantsModule, getNestedProperty } from './moduleLoader';

/**
 * 处理枚举API调用并更新属性
 * @param {Object} property - 要更新的属性对象
 * @param {Object} propConfig - 属性配置
 * @param {string} apiBasePath - API基础路径（仅用于兼容）
 * @returns {Promise<boolean>} 处理成功返回true，否则返回false
 */
async function processEnumApi(property, propConfig, apiBasePath = '@/api/index.js') {
  try {
    // 首先检查是否有枚举API配置
    if (!propConfig.enumApi) {
      console.warn('处理字段时缺少enumApi配置');
      throw new Error('未提供enumApi配置');
    }

    // 统一处理API调用
    try {
      // 加载API模块
      const apiModule = await loadApiModule();
      
      // 获取API函数 - 支持点表示法访问嵌套API
      const apiFunc = getNestedProperty(apiModule, propConfig.enumApi);
      
      if (typeof apiFunc !== 'function') {
        console.error(`API ${propConfig.enumApi} 不是一个有效的函数`);
        throw new Error(`API ${propConfig.enumApi} 不是一个函数`);
      }
      
      // 调用API函数
      const params = propConfig.enumApiParams || {};
      console.log(`正在调用API: ${propConfig.enumApi}`, params);
      const response = await apiFunc(params);
      
      // 处理API响应
      if (response && response.code === 0 && response.data && Array.isArray(response.data)) {
        // 从API响应中提取enum和enumNames
        property.enum = response.data.map(item => item.code || item.value);
        property.enumNames = response.data.map(item => item.name || item.label);
        property.uniqueItems = false;
        property["ui:options"].clearable = true;
        return true;
      } else {
        console.warn(`API调用 ${propConfig.enumApi} 返回无效数据:`, response);
        throw new Error(`API调用返回无效数据: ${JSON.stringify(response)}`);
      }
    } catch (apiError) {
      console.error(`调用API ${propConfig.enumApi} 失败:`, apiError);
      throw apiError;
    }
  } catch (error) {
    console.error('获取枚举数据失败:', error);
  }
  
  // 如果API调用失败，设置空的enum和enumNames
  property.enum = [];
  property.enumNames = [];
  property.uniqueItems = false;
  property["ui:options"].clearable = true;
  return false;
}

/**
 * 从字典中获取枚举数据
 * @param {string} dictCode - 字典代码
 * @param {string} dictBasePath - 字典基础路径（仅用于兼容）
 * @returns {Promise<Array|null>} 字典数据数组或null
 */
async function getEnumFromDictMaps(dictCode, dictBasePath = '@/constants/index.js') {
  try {
    if (!dictCode) {
      throw new Error('dictCode不能为空');
    }
    
    // 加载常量模块
    const dictModule = await loadConstantsModule();
    
    // 获取字典数据 - 支持点表示法访问嵌套字典
    const dictData = getNestedProperty(dictModule, dictCode);
    
    if (!dictData || !Array.isArray(dictData)) {
      console.warn(`未找到有效的字典数据: ${dictCode}`);
      return null;
    }
    
    return dictData;
  } catch (error) {
    console.error(`获取字典数据失败[${dictCode}]:`, error.message);
    return null;
  }
}

const moduleCache = new Map();

async function getModule(key, importFn) {
  if (!moduleCache.has(key)) {
    moduleCache.set(key, await importFn());
  }
  return moduleCache.get(key);
}

/**
 * 处理任何带有 bindBlock 和 bindCode 的字段并生成关联字段
 * @param {string} key - 模块键名（如JBXX）
 * @param {Object} jsonSchema - JsonSchema对象
 * @param {string} propKey - 属性键名
 * @param {Object} propConfig - 属性配置
 * @param {Object} dictApiMaps - 字典数据映射（仅同步模式使用）
 * @returns {void}
 */
function processBindField(key, jsonSchema, propKey, propConfig, dictApiMaps = {}) {
  // 获取主字段和绑定字段的键名
  const mainField = propKey;
  const bindField = propConfig.bindCode || `${mainField}Code`;
  const blockKey = propConfig.bindBlock || key;
  
  // 先处理主字段
  const mainProperty = {
    type: propConfig.type ? propConfig.type.toLowerCase() : "string",
    title: propConfig.title || "",
    "ui:emptyValue": propConfig.emptyValue || "",
    "ui:hidden": propConfig.hidden || false,
    bindBlock: blockKey,
    bindCode: bindField,
    "ui:options": {
      disabled: propConfig.disabled || false,
      placeholder: propConfig.placeholder || (propConfig.widget === 'AreaWidget' ? "请选择" : "请输入")
    },
    extProperties: {},
    "err:required": propConfig.requiredMessage || 
      (propConfig.widget === 'AreaWidget' ? 
        `请选择${propConfig.title || "省市区"}` : 
        `请输入${propConfig.title || ""}`)
  };
  
  // 处理HR属性 - 以hr开头的自定义属性
  Object.keys(propConfig).forEach(key => {
    if (key.startsWith('hr')) {
      mainProperty[key] = propConfig[key];
    }
  });
  
  // 特殊处理 AreaWidget
  if (propConfig.widget === 'AreaWidget') {
    mainProperty["ui:widget"] = "AreaWidget";
  }
  // 处理其他自定义组件
  else if (propConfig.widget && propConfig.widget !== 'uploadWidget') {
    mainProperty["ui:widget"] = propConfig.widget;
  }
  
  // 处理验证规则
  if (propConfig.pattern) {
    mainProperty["ui:options"].pattern = propConfig.pattern;
    mainProperty["ui:options"]["err:pattern"] = propConfig.patternMessage || "格式不正确";
  }

  // 处理最大长度
  if (propConfig.maxLength) {
    mainProperty["ui:options"].maxLength = propConfig.maxLength;
  }
  
  // 处理枚举值 - 优先级: enums > enumDict
  if (propConfig.enums && propConfig.enums.length > 0) {
    // 处理静态枚举选项
    mainProperty.enum = propConfig.enums.map(item => item.value || item.code);
    mainProperty.enumNames = propConfig.enums.map(item => item.label || item.name);
    mainProperty.uniqueItems = false;
    mainProperty["ui:options"].clearable = true;
  } else if (propConfig.enumDict && dictApiMaps && dictApiMaps[propConfig.enumDict]) {
    // 处理字典枚举选项
    const dictData = dictApiMaps[propConfig.enumDict];
    if (dictData && Array.isArray(dictData)) {
      mainProperty.enum = dictData.map(item => item.value || item.code);
      mainProperty.enumNames = dictData.map(item => item.label || item.name);
      mainProperty.uniqueItems = false;
      mainProperty["ui:options"].clearable = true;
    } else {
      // 防御性编程：确保即使字典数据异常也能正常处理
      mainProperty.enum = [];
      mainProperty.enumNames = [];
    }
  }
  
  // 将主字段添加到jsonSchema
  jsonSchema.properties[key].properties[mainField] = mainProperty;
  
  // 如果是必填字段，添加到required数组
  if (propConfig.required) {
    jsonSchema.properties[key].required.push(mainField);
  }
  
  // 处理绑定字段（隐藏字段）
  // 防止生成重复字段：检查绑定字段是否已存在
  if (!jsonSchema.properties[key].properties[bindField]) {
    // 创建绑定字段（隐藏的值字段，永远是非必填隐藏字段）
    jsonSchema.properties[key].properties[bindField] = {
      type: "string",
      title: `${propConfig.title || (propConfig.widget === 'AreaWidget' ? "省市区" : "")}Code`,
      "ui:emptyValue": "",
      "ui:hidden": true, // 始终隐藏
      bindBlock: blockKey,
      bindCode: mainField,
      "ui:options": {
        disabled: propConfig.disabled || false
      },
      extProperties: {},
    };
  }
}

/**
 * 异步转换schema
 * @param {Object} formConfig - 表单配置
 * @param {Object} options - 可选参数配置
 * @param {String} options.apiBasePath - API基础路径，默认'@/api/index.js'
 * @param {String} options.dictBasePath - 字典基础路径，默认'@/constants/index.js'
 * @returns {Promise<Object>} jsonSchema
 */
export async function renderJsonSchemaAsync(formConfig, options = {}) {
  // 检查配置有效性
  if (!formConfig || !formConfig.config) {
    console.warn('表单配置无效');
    return null;
  }

  // 提取配置项（为保持兼容性，保留这些参数）
  const {
    apiBasePath = '@/api/index.js',
    dictBasePath = '@/constants/index.js'
  } = options;

  const config = formConfig.config;
  
  // 初始化JsonSchema基础结构
  const jsonSchema = {
    title: config.title || "title",
    type: "object",
    required: [],
    properties: {},
    "ui:options": {
      canBeFolded: true,
      hrBlockType: "0"
    },
  };

  // 跟踪所有API调用的Promise
  const apiPromises = [];

  // 遍历每个模块（如JBXX, QTXX等）
  Object.keys(config).forEach(key => {
    if (key === 'title') return; // 跳过标题字段
    
    const moduleConfig = config[key];
    if (!moduleConfig.properties) return;

    // 创建模块结构
    jsonSchema.properties[key] = {
      title: moduleConfig.title || "",
      required: [],
      properties: {}
    };

    // 处理模块内的每个属性
    Object.keys(moduleConfig.properties).forEach(propKey => {
      const propConfig = moduleConfig.properties[propKey];
      
      // 检查是否需要处理绑定字段
      if (propConfig.bindBlock && propConfig.bindCode) {
        // 处理带有绑定关系的字段，会自动生成一个隐藏的关联字段
        processBindField(key, jsonSchema, propKey, propConfig);
        return; // 跳过标准处理流程
      }
      
      // 如果属性是必填的，添加到required数组
      if (propConfig.required) {
        jsonSchema.properties[key].required.push(propKey);
      }

      // 判断是否有枚举选项，用于后续设置placeholder和requiredMessage
      const hasEnumOptions = !!(propConfig.enums || propConfig.enumDict || propConfig.enumApi);

      // 设置属性的基本信息
      const property = {
        type: propConfig.type ? propConfig.type.toLowerCase() : "string",
        title: propConfig.title || "",
        "ui:emptyValue": propConfig.emptyValue || "",
        "ui:options": {
          disabled: propConfig.disabled || false,
          placeholder: propConfig.placeholder || (hasEnumOptions ? "请选择" : "请输入")
        },
        extProperties: {},
        "err:required": propConfig.requiredMessage || 
          (hasEnumOptions ? `请选择${propConfig.title}` : `请输入${propConfig.title}`)
      };

      // 处理HR属性 - 以hr开头的自定义属性
      Object.keys(propConfig).forEach(key => {
        if (key.startsWith('hr')) {
          property[key] = propConfig[key];
        }
      });
      
      // 处理特殊类型
      if (propConfig.type === 'Array') {
        property.type = 'array';
        
        // 处理上传组件
        if (propConfig.widget === 'uploadWidget') {
          property.minItems = 0;
          property.maxItems = propConfig.maxCount || 50;
          property.items = {
            type: "object"
          };
          property["ui:widget"] = "uploadWidget";
          property["ui:options"] = {
            ...property["ui:options"],
            maxCount: propConfig.maxCount || 50,
            maxSize: propConfig.maxSize || 20971520,
            fileTypes: propConfig.fileTypes || "jpeg,jpg,png"
          };
        }
      }

      // 优先级处理: enums > enumDict > enumApi
      let enumProcessed = false;
      
      // 1. 首先检查是否存在 enums（静态配置的枚举选项）
      if (propConfig.enums && propConfig.enums.length > 0) {
        property.enum = propConfig.enums.map(item => item.value || item.code);
        property.enumNames = propConfig.enums.map(item => item.label || item.name);
        property.uniqueItems = false;
        property["ui:options"].clearable = true;
        enumProcessed = true;
      } 
      // 2. 如果没有enums，检查enumDict（从字典中获取枚举）
      else if (propConfig.enumDict) {
        property.uniqueItems = false;
        property["ui:options"].clearable = true;
        
        // 创建一个Promise来处理字典加载，并跟踪它
        const dictPromise = (async () => {
          try {
            const dictData = await getEnumFromDictMaps(propConfig.enumDict, dictBasePath);
            if (dictData && Array.isArray(dictData) && dictData.length > 0) {
              property.enum = dictData.map(item => item.value || item.code);
              property.enumNames = dictData.map(item => item.label || item.name);
              enumProcessed = true;
            } else {
              // 如果获取失败或数据为空，设置空的enum和enumNames
              console.warn(`字典数据 ${propConfig.enumDict} 为空或无效`);
              property.enum = [];
              property.enumNames = [];
            }
          } catch (error) {
            console.error(`加载字典 ${propConfig.enumDict} 出错:`, error);
            // 确保即使出错也有默认值
            property.enum = [];
            property.enumNames = [];
          }
        })();
        
        apiPromises.push(dictPromise);
      }
      // 3. 如果没有enums和enumDict，检查enumApi（从API获取枚举）
      else if (propConfig.enumApi && !enumProcessed) {
        // 创建一个Promise来处理API调用，并跟踪它
        const apiPromise = processEnumApi(property, propConfig, apiBasePath);
        apiPromises.push(apiPromise);
        enumProcessed = true;
      }

      // 处理验证规则
      if (propConfig.pattern) {
        property["ui:options"].pattern = propConfig.pattern;
        property["ui:options"]["err:pattern"] = propConfig.patternMessage || "格式不正确";
      }

      // 处理最大长度
      if (propConfig.maxLength) {
        property["ui:options"].maxLength = propConfig.maxLength;
      }

      // 处理隐藏配置
      if (propConfig.hidden) {
        property["ui:hidden"] = true;
      }

      // 处理绑定配置
      if (propConfig.bindBlock) {
        property.bindBlock = propConfig.bindBlock;
        // 移除 ui:options 中的 bindBlock，避免重复
        delete property["ui:options"].bindBlock;
      }
      
      if (propConfig.bindCode) {
        property.bindCode = propConfig.bindCode;
        // 移除 ui:options 中的 bindCode，避免重复
        delete property["ui:options"].bindCode;
      }

      // 自定义组件
      if (propConfig.widget && propConfig.widget !== 'uploadWidget') {
        property["ui:widget"] = propConfig.widget;
      }

      // 将属性添加到模块的properties中
      jsonSchema.properties[key].properties[propKey] = property;
    });
  });

  // 等待所有API调用完成
  await Promise.all(apiPromises);

  return jsonSchema;
}

// 导出异步版本作为默认导出
export default renderJsonSchemaAsync;