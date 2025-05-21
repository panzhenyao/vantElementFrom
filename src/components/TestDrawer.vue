<template>
  <pc-drawer
    title="测试抽屉"
    :visible.sync="visibleSync"
    direction="rtl"
    size="40%"
    :before-close="handleClose"
    append-to-body
  >
    <div class="drawer-content">
      <h3>测试抽屉内容</h3>
      <p>这是一个用于测试的简单抽屉组件</p>
      
      <pc-form :model="mockData" label-width="100px">
        <pc-form-item label="编码">
          <pc-input v-model="mockData.code" placeholder="请输入编码"></pc-input>
        </pc-form-item>
        
        <pc-form-item label="标题">
          <pc-input v-model="mockData.fieldConfig.title" placeholder="请输入标题"></pc-input>
        </pc-form-item>
      </pc-form>
      
      <div class="drawer-footer">
        <pc-button @click="handleClose">取消</pc-button>
        <pc-button type="primary" @click="handleSubmit">确定</pc-button>
      </div>
    </div>
  </pc-drawer>
</template>

<script>
export default {
  name: 'TestDrawer',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visibleSync: this.visible, // 初始化时直接从prop获取
      mockData: {
        code: 'test_field_' + Date.now().toString().slice(-6),
        fieldConfig: {
          title: '测试字段',
          type: 'string',
          placeholder: '请输入测试内容',
          required: false
        }
      }
    }
  },
  watch: {
    // 直接监听visible prop的变化
    visible: {
      handler(newVal) {
        console.log('TestDrawer: visible prop changed to', newVal);
        this.visibleSync = newVal;
      },
      immediate: true // 立即执行一次
    }
  },
  methods: {
    // 处理关闭
    handleClose() {
      console.log('TestDrawer: 关闭');
      this.visibleSync = false;
      this.$emit('update:visible', false);
      this.$emit('close');
    },
    
    // 处理提交
    handleSubmit() {
      console.log('TestDrawer: 提交', this.mockData);
      this.$emit('submit', this.mockData);
      this.handleClose();
    }
  },
  mounted() {
    // 输出初始状态
    console.log('TestDrawer: 组件已挂载，visibleSync =', this.visibleSync);
  }
}
</script>

<style scoped>
.drawer-content {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
}

.drawer-footer {
  margin-top: 20px;
  text-align: right;
  padding: 10px 0;
  border-top: 1px solid #ebeef5;
}

/* 确保抽屉组件可见 */
::v-deep .pc-drawer {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  z-index: 20000 !important;
}

::v-deep .pc-drawer__wrapper {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  left: 0 !important;
  overflow: auto !important;
  z-index: 20000 !important;
}

::v-deep .pc-drawer__container {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  width: 40% !important;
  height: 100% !important;
  z-index: 20000 !important;
  background-color: white !important;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
}

::v-deep .v-modal {
  position: fixed !important;
  left: 0 !important;
  top: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background-color: rgba(0, 0, 0, 0.5) !important;
  z-index: 19999 !important;
}
</style> 