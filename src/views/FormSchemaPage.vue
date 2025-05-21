<template>
  <div class="form-preview">
    <h2>表单渲染</h2>
    <div class="form-controls">
      <pc-radio-group v-model="activeFormType" size="small">
        <pc-radio-button label="element">PC-UI (Element)</pc-radio-button>
        <pc-radio-button label="vant">Vant UI</pc-radio-button>
      </pc-radio-group>
      <div class="form-actions">
        <pc-button size="small" @click="resetForm" type="info">重置表单</pc-button>
        <pc-button size="small" @click="showDataPreview = !showDataPreview" type="primary">
          {{ showDataPreview ? '隐藏数据' : '显示数据' }}
        </pc-button>
      </div>
    </div>
    
    <pc-card v-if="showDataPreview" class="data-preview-card">
      <div class="preview-tabs">
        <pc-tabs v-model="activeTab">
          <pc-tab-pane label="表单数据" name="formData">
            <div class="data-preview-header">
              <h3>表单数据 (formData)</h3>
              <p>当前表单的数据对象</p>
            </div>
            <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
          </pc-tab-pane>
          <pc-tab-pane label="Schema数据" name="schema">
            <div class="data-preview-header">
              <h3>Schema数据 (transformSchema渲染结果)</h3>
              <p>渲染表单使用的schema配置对象</p>
            </div>
            <pre>{{ JSON.stringify(schema, null, 2) }}</pre>
          </pc-tab-pane>
        </pc-tabs>
      </div>
    </pc-card>
    
    <pc-card class="box-card" v-show="activeFormType === 'element'">
      <div class="form-type-info">
        <h3>PC-UI 表单 (Element 基础)</h3>
        <p>使用 Element UI 二次封装的 PC 端组件库渲染表单</p>
      </div>
      <div class="form-container">
        <vue-form
          v-model="formData"
          :schema="schema"
          :form-props="formProps"
          @on-form-mounted="handleFormMounted"
        >
        </vue-form>
        <div class="form-submit-area">
          <pc-button type="primary" @click="saveData">提交表单</pc-button>
        </div>
      </div>
    </pc-card>
    
    <pc-card class="box-card" v-show="activeFormType === 'vant'">
      <div class="form-type-info">
        <h3>Vant UI 表单</h3>
        <p>使用 Vant UI 移动端组件库渲染表单</p>
      </div>
      <div class="form-container vant-container">
        <VueFormVant2
          v-model="formData"
          :formProps="formProps"
          :schema="schema"
          @on-form-mounted="handleFormMounted"
        >
        </VueFormVant2>
        <div class="form-submit-area vant-submit">
          <pc-button type="primary" @click="saveData">提交表单</pc-button>
        </div>
      </div>
    </pc-card>
    
    <pc-dialog
      title="表单提交成功"
      :visible.sync="dialogVisible"
      width="50%"
    >
      <div>
        <h4>表单数据:</h4>
        <pre>{{ JSON.stringify(submittedData, null, 2) }}</pre>
      </div>
      <span slot="footer" class="dialog-footer">
        <pc-button @click="dialogVisible = false">关闭</pc-button>
      </span>
    </pc-dialog>
  </div>
</template>

<script>
import VueForm from '@/components/VueFormELement/vueJsonSchemaForm.umd.min.js'
import VueFormVant2 from '@/components/VueFormVant2/vue2-form-iview3.esm.min'
import  { formData, jsonSchema } from './formView/index.js'
import EventBus from '@/utils/eventBus'

/**
 * 表单预览页面组件
 * 用于实时预览配置生成的表单效果
 */
export default {
  name: 'FormSchemaPage',
  components: {
    VueForm,
    VueFormVant2
  },
  data() {
    return {
      // 表单相关
      activeFormType: 'element', // PC端表单
      activeTab: 'formData', // 数据预览标签
      schema: jsonSchema, // Schema配置
      formData: JSON.parse(JSON.stringify(formData)), // 表单数据
      originalFormData: JSON.parse(JSON.stringify(formData)), // 原始数据
      formPropsPC: {
        layoutColumn: 1, // 修改为1列布局
        inlineFooter: true,
        labelPosition: 'top', // 修改标签位置为top
        labelWidth: '120px',
        labelSuffix: ':',
      },
      formPropsVant: {
        layoutColumn: 1,
        inlineFooter: true,
        labelPosition: 'top',
        labelWidth: '120px',
        labelSuffix: ':',
      },
      formRef: null,
      showDataPreview: false,
      dialogVisible: false,
      submittedData: null
    }
  },
  computed: {
    formProps() {
      // 根据当前选择的表单类型返回对应的表单配置
      return this.activeFormType === 'element' ? this.formPropsPC : this.formPropsVant;
    }
  },
  watch: {
    activeFormType(newVal, oldVal) {
      // 可以在这里处理表单类型切换逻辑
      console.log(`表单类型从 ${oldVal} 切换到 ${newVal}`);
    }
  },
  created() {
    // 监听配置更新事件
    EventBus.$on('schema-updated', this.handleSchemaUpdated)
  },
  beforeDestroy() {
    // 组件销毁前移除事件监听
    EventBus.$off('schema-updated', this.handleSchemaUpdated)
  },
  methods: {
    handleFormMounted(getForm, formData) {
      this.formRef = getForm
    },
    handleSchemaUpdated(newSchema) {
      // 更新表单架构
      if (newSchema) {
        this.schema = newSchema
        // 自动切换到Schema标签，显示更新后的Schema
        if (this.showDataPreview) {
          this.activeTab = 'schema'
        }
      }
    },
    resetForm() {
      // 重置表单数据为初始值
      this.formData = JSON.parse(JSON.stringify(this.originalFormData))
      this.$message.success('表单已重置')
    },
    saveData() {
      console.log('表单数据:', this.formData)
      this.submittedData = JSON.parse(JSON.stringify(this.formData))
      this.dialogVisible = true
    }
  }
}
</script>

<style scoped>
.form-preview {
  max-width: 100%;
  margin: 0 auto;
  padding: 5px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

h2 {
  text-align: center;
  margin: 5px 0;
}

.form-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
  gap: 15px;
}

.form-actions {
  margin-left: 10px;
  display: flex;
  gap: 10px;
}

.box-card {
  width: 100%;
  flex: 1;
  overflow: auto;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
}

.data-preview-card {
  margin-bottom: 8px;
  max-height: 25%;
  overflow: hidden;
}

.preview-tabs {
  height: 100%;
}

.data-preview-header {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
  margin: 8px 0 5px;
  text-align: left;
}

.data-preview-header h3 {
  margin: 0 0 5px;
  font-size: 16px;
  font-weight: 600;
}

.data-preview-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.form-type-info {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
  margin-bottom: 8px;
  text-align: left;
}

.form-type-info h3 {
  margin: 0 0 5px;
  font-size: 16px;
  font-weight: 600;
}

.form-type-info p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.form-container {
  padding: 0 10px;
  flex: 1;
  overflow: auto;
}

.vant-container {
  max-width: 375px;
  margin: 0 auto;
  background: #f7f8fa;
  padding: 10px;
  border-radius: 8px;
}

.form-submit-area {
  margin-top: 10px;
  padding: 5px 0;
  text-align: center;
}

.vant-submit {
  margin-top: 10px;
}

pre {
  text-align: left;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  background-color: #f5f7fa;
  padding: 8px;
  border-radius: 4px;
  max-height: 150px;
  overflow: auto;
}

::v-deep .pc-tabs__header {
  padding: 0 10px;
  margin: 0;
}

::v-deep .pc-tabs__content {
  padding: 0 10px 8px;
  overflow: auto;
}

::v-deep .pc-tabs__nav-wrap::after {
  height: 1px;
}
</style>