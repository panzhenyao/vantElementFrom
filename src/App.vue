<template>
  <div id="app">
    <h1>Vue表单配置器</h1>
    <div class="container">
      <!-- 左右布局容器 -->
      <div class="layout">
        <div class="left">
          <FormConfigPage />
        </div>
        <div class="right">
          <FormSchemaPage />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FormConfigPage from '@/views/FormConfigPage.vue'
import FormSchemaPage from '@/views/FormSchemaPage.vue'

export default {
  name: 'App',
  components: {
    FormConfigPage, // 表单配置页面组件
    FormSchemaPage  // 表单预览页面组件
  }
}
</script>

<style>
/* 全局样式设置 */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 主容器样式 */
.container {
  max-width: 1400px;
  flex: 1;
  margin: 0 auto;
  padding: 0 10px;
  display: flex;
  flex-direction: column;
}

/* 左右布局样式 */
.layout {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  flex: 1;
  overflow: hidden;
}

/* 左侧面板样式 */
.left {
  flex: 1;
  min-width: 0;
  overflow: auto;
}

/* 右侧面板样式 */
.right {
  flex: 1;
  min-width: 0;
  overflow: auto;
}

/* 响应式布局 */
@media (max-width: 992px) {
  .layout {
    flex-direction: column;
  }
}

/* Vant 移动端组件容器 */
.vant-demo {
  width: 480px;
}
</style>
