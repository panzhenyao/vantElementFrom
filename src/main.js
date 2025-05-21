/**
 * 项目入口文件
 * 初始化 Vue 实例并加载主要依赖
 */
import Vue from 'vue'
import App from './App.vue'
// 引入 PC 端的 Element UI 组件库配置
import './plugins/element.js'
// 引入移动端的 Vant 组件库配置
import  './plugins/vant.js'
// 引入 Element UI 主题
import('@hrfe/pc-ui/theme/gonghang.css')

Vue.config.productionTip = false

// 创建 Vue 根实例
new Vue({
  render: h => h(App),
}).$mount('#app')