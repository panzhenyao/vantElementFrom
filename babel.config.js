/**
 * Babel 配置文件
 * 用于配置 JavaScript 代码的转换规则
 */
module.exports = {
  // 预设配置
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  // 插件配置
  plugins: [
    // Element UI 按需引入配置
    ['component', {
      libraryName: 'element-ui',
      styleLibraryName: 'theme-chalk'
    }],
    // Vant UI 按需引入配置
    ['import', {
      libraryName: 'vant',
      libraryDirectory: 'es',
      style: true
    }, 'vant']
  ]
}