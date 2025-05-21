/**
 * 模块加载器 - 用于优化动态导入
 * 提供缓存和多重尝试机制，确保模块加载可靠性
 */

// 模块缓存，避免重复加载
const moduleCache = new Map();

/**
 * 加载 API 模块
 * @returns {Promise<Object>} API 模块
 */
export async function loadApiModule() {
  const cacheKey = 'apiModule';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  let module;
  
  // 尝试方法 1: 使用 import() 与相对路径
  try {
    const importedModule = await import('../api/index.js');
    module = importedModule.default || importedModule;
    console.log('API 模块加载成功 (方法1)');
  } catch (err1) {
    console.warn('API 模块加载失败 (方法1):', err1);
    
    // 尝试方法 2: 使用 require
    try {
      const requiredModule = require('../api/index.js');
      module = requiredModule.default || requiredModule;
      console.log('API 模块加载成功 (方法2)');
    } catch (err2) {
      console.warn('API 模块加载失败 (方法2):', err2);
      
      // 尝试方法 3: 使用 import() 与别名路径
      try {
        const aliasModule = await import('@/api/index.js');
        module = aliasModule.default || aliasModule;
        console.log('API 模块加载成功 (方法3)');
      } catch (err3) {
        console.error('所有 API 模块加载方法均失败:', { err1, err2, err3 });
        throw new Error('无法加载 API 模块');
      }
    }
  }
  
  // 存入缓存
  moduleCache.set(cacheKey, module);
  return module;
}

/**
 * 加载常量模块
 * @returns {Promise<Object>} 常量模块
 */
export async function loadConstantsModule() {
  const cacheKey = 'constantsModule';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  let module;
  
  // 尝试方法 1: 使用 import() 与相对路径
  try {
    const importedModule = await import('../constants/index.js');
    module = importedModule.default || importedModule;
    console.log('常量模块加载成功 (方法1)');
  } catch (err1) {
    console.warn('常量模块加载失败 (方法1):', err1);
    
    // 尝试方法 2: 使用 require
    try {
      const requiredModule = require('../constants/index.js');
      module = requiredModule.default || requiredModule;
      console.log('常量模块加载成功 (方法2)');
    } catch (err2) {
      console.warn('常量模块加载失败 (方法2):', err2);
      
      // 尝试方法 3: 使用 import() 与别名路径
      try {
        const aliasModule = await import('@/constants/index.js');
        module = aliasModule.default || aliasModule;
        console.log('常量模块加载成功 (方法3)');
      } catch (err3) {
        console.error('所有常量模块加载方法均失败:', { err1, err2, err3 });
        throw new Error('无法加载常量模块');
      }
    }
  }
  
  // 存入缓存
  moduleCache.set(cacheKey, module);
  return module;
}

/**
 * 获取嵌套属性值
 * @param {Object} obj - 对象
 * @param {string} path - 路径，例如 'a.b.c'
 * @returns {*} 属性值
 */
export function getNestedProperty(obj, path) {
  if (!path || !obj) return undefined;
  
  // 非嵌套属性直接返回
  if (!path.includes('.')) {
    return obj[path];
  }
  
  // 处理嵌套属性
  return path.split('.').reduce((current, key) => {
    if (current === undefined || current === null) {
      return undefined;
    }
    return current[key];
  }, obj);
}

/**
 * 清除模块缓存
 */
export function clearModuleCache() {
  moduleCache.clear();
  console.log('模块缓存已清除');
} 