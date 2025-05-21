<template>
  <pc-drawer
    :title="configType === 'block' ? '区块配置' : '字段配置'"
    :visible.sync="visibleSync"
    direction="rtl"
    size="40%"
    :before-close="handleClose"
    append-to-body
  >
    <div class="drawer-content">
      <pc-form 
        :model="formData" 
        label-width="100px" 
        label-position="top"
        ref="configForm"
      >
        <!-- 基础配置部分，通用于区块和字段 -->
        <pc-form-item label="标识编码" prop="code" :rules="[
          { required: true, message: '请输入标识编码', trigger: 'blur' },
          { pattern: configType === 'block' ? /^[A-Z0-9_]+$/ : /^[a-zA-Z0-9_]+$/, 
            message: configType === 'block' ? '区块编码只能包含大写字母、数字和下划线' : '字段编码只能包含字母、数字和下划线', 
            trigger: 'blur' }
        ]">
          <pc-input 
            v-model="formData.code" 
            :placeholder="configType === 'block' ? '请输入区块编码(大写字母数字下划线)' : '请输入字段编码'"
          ></pc-input>
        </pc-form-item>
        
        <!-- 区块配置的特有字段 -->
        <template v-if="configType === 'block'">
          <pc-form-item label="区块标题" prop="config.title">
            <pc-input v-model="formData.config.title" placeholder="请输入区块标题"></pc-input>
          </pc-form-item>
          
          <pc-form-item label="允许折叠">
            <pc-switch v-model="formData.blockConfig.canBeFolded"></pc-switch>
          </pc-form-item>
          
          <pc-form-item label="区块类型">
            <pc-select v-model="formData.blockConfig.hrBlockType" placeholder="请选择区块类型">
              <pc-option label="普通区块" value="normal"></pc-option>
              <pc-option label="主要区块" value="primary"></pc-option>
              <pc-option label="成功区块" value="success"></pc-option>
              <pc-option label="警告区块" value="warning"></pc-option>
              <pc-option label="危险区块" value="danger"></pc-option>
            </pc-select>
          </pc-form-item>
        </template>
        
        <!-- 字段配置的特有字段 -->
        <template v-else>
          <!-- 基础信息 -->
          <pc-form-item label="字段标题" prop="fieldConfig.title">
            <pc-input v-model="formData.fieldConfig.title" placeholder="请输入字段标题"></pc-input>
          </pc-form-item>
          
          <pc-form-item label="字段类型">
            <pc-select v-model="formData.fieldConfig.type" placeholder="请选择字段类型">
              <pc-option label="字符串" value="string"></pc-option>
              <pc-option label="数字" value="number"></pc-option>
              <pc-option label="数组" value="Array"></pc-option>
            </pc-select>
          </pc-form-item>
          
          <pc-form-item label="提示文本">
            <pc-input v-model="formData.fieldConfig.placeholder" placeholder="请输入提示文本"></pc-input>
          </pc-form-item>
          
          <pc-form-item label="是否必填">
            <pc-switch v-model="formData.fieldConfig.required"></pc-switch>
          </pc-form-item>
          
          <pc-form-item v-if="formData.fieldConfig.required" label="必填提示">
            <pc-input v-model="formData.fieldConfig.requiredMessage" placeholder="请输入必填提示信息"></pc-input>
          </pc-form-item>
          
          <pc-form-item label="是否禁用">
            <pc-switch v-model="formData.fieldConfig.disabled"></pc-switch>
          </pc-form-item>
          
          <pc-form-item label="是否隐藏">
            <pc-switch v-model="formData.fieldConfig.hidden"></pc-switch>
          </pc-form-item>
          
          <!-- 字符串类型特有配置 -->
          <template v-if="formData.fieldConfig.type === 'string'">
            <pc-form-item label="组件类型">
              <pc-select v-model="fieldComponentType" placeholder="请选择组件类型">
                <pc-option label="文本输入框" value="inputText"></pc-option>
                <pc-option label="选择器" value="selectSimple"></pc-option>
                <pc-option label="远程选择器" value="selectRemote"></pc-option>
                <pc-option label="日期选择器" value="datePicker"></pc-option>
                <pc-option label="省市区选择器" value="areaSelector"></pc-option>
              </pc-select>
            </pc-form-item>
            
            <!-- 文本输入框特有配置 -->
            <template v-if="fieldComponentType === 'inputText'">
              <pc-form-item label="最大长度">
                <pc-input-number v-model="formData.fieldConfig.maxLength" :min="0"></pc-input-number>
              </pc-form-item>
              
              <pc-form-item label="验证规则">
                <pc-input v-model="formData.fieldConfig.pattern" placeholder="请输入正则表达式"></pc-input>
              </pc-form-item>
              
              <pc-form-item label="验证提示">
                <pc-input v-model="formData.fieldConfig.patternMessage" placeholder="请输入验证失败提示"></pc-input>
              </pc-form-item>
            </template>
            
            <!-- 选择器特有配置 -->
            <template v-if="fieldComponentType === 'selectSimple'">
              <pc-form-item label="枚举字典">
                <pc-input v-model="formData.fieldConfig.enumDict" placeholder="请输入枚举字典名称"></pc-input>
              </pc-form-item>
              
              <pc-form-item label="选择模式">
                <pc-select v-model="formData.fieldConfig.mode" placeholder="请选择模式">
                  <pc-option label="单选" value="single"></pc-option>
                  <pc-option label="多选" value="multiple"></pc-option>
                </pc-select>
              </pc-form-item>
              
              <pc-form-item label="允许清除">
                <pc-switch v-model="formData.fieldConfig.allowClear"></pc-switch>
              </pc-form-item>
            </template>
            
            <!-- 远程选择器特有配置 -->
            <template v-if="fieldComponentType === 'selectRemote'">
              <pc-form-item label="API名称">
                <pc-input v-model="formData.fieldConfig.enumApi" placeholder="请输入API名称"></pc-input>
              </pc-form-item>
              
              <pc-form-item label="API参数">
                <pc-input 
                  type="textarea" 
                  v-model="apiParamsString" 
                  placeholder="请输入JSON格式参数"
                  @input="updateApiParams"
                ></pc-input>
              </pc-form-item>
              
              <pc-form-item label="选择模式">
                <pc-select v-model="formData.fieldConfig.mode" placeholder="请选择模式">
                  <pc-option label="单选" value="single"></pc-option>
                  <pc-option label="多选" value="multiple"></pc-option>
                </pc-select>
              </pc-form-item>
              
              <pc-form-item label="允许清除">
                <pc-switch v-model="formData.fieldConfig.allowClear"></pc-switch>
              </pc-form-item>
            </template>
            
            <!-- 日期选择器特有配置 -->
            <template v-if="fieldComponentType === 'datePicker'">
              <pc-form-item label="日期格式">
                <pc-input v-model="formData.fieldConfig.format" placeholder="例如: yyyy-MM-dd"></pc-input>
              </pc-form-item>
              
              <pc-form-item label="显示时间">
                <pc-switch v-model="formData.fieldConfig.showTime"></pc-switch>
              </pc-form-item>
              
              <pc-form-item label="禁用过去日期">
                <pc-switch v-model="formData.fieldConfig.disablePast"></pc-switch>
              </pc-form-item>
              
              <pc-form-item label="禁用未来日期">
                <pc-switch v-model="formData.fieldConfig.disableFuture"></pc-switch>
              </pc-form-item>
            </template>
            
            <!-- 省市区选择器特有配置 -->
            <template v-if="fieldComponentType === 'areaSelector'">
              <div class="group-title">省市区选择器配置</div>
              <pc-form-item label="绑定区块编码" title="不填默认为当前区块">
                <pc-input v-model="formData.fieldConfig.bindBlock" :placeholder="cursor && cursor.blockKey ? `当前区块: ${cursor.blockKey}` : '不填则默认为当前区块编码'"></pc-input>
                <div class="tips-text" v-if="cursor && cursor.blockKey">当前所在区块: {{cursor.blockKey}}</div>
              </pc-form-item>
              
              <pc-form-item label="绑定字段编码" title="不填默认会生成为当前字段名+Code">
                <pc-input v-model="formData.fieldConfig.bindCode" :placeholder="formData.code ? `默认值: ${formData.code}Code` : '不填则默认会生成为当前字段名+Code'"></pc-input>
                <div class="tips-text">配置后会自动生成两个关联字段</div>
              </pc-form-item>
            </template>
          </template>
          
          <!-- 数字类型特有配置 -->
          <template v-if="formData.fieldConfig.type === 'number'">
            <pc-form-item label="最小值">
              <pc-input-number v-model="formData.fieldConfig.min"></pc-input-number>
            </pc-form-item>
            
            <pc-form-item label="最大值">
              <pc-input-number v-model="formData.fieldConfig.max"></pc-input-number>
            </pc-form-item>
            
            <pc-form-item label="步长">
              <pc-input-number v-model="formData.fieldConfig.step" :min="0"></pc-input-number>
            </pc-form-item>
            
            <pc-form-item label="精度">
              <pc-input-number v-model="formData.fieldConfig.precision" :min="0" :max="10"></pc-input-number>
            </pc-form-item>
          </template>
          
          <!-- 数组类型特有配置 -->
          <template v-if="formData.fieldConfig.type === 'Array'">
            <pc-form-item label="组件类型">
              <pc-select v-model="formData.fieldConfig.widget" placeholder="请选择组件类型">
                <pc-option label="上传组件" value="uploadWidget"></pc-option>
              </pc-select>
            </pc-form-item>
            
            <!-- 上传组件特有配置 -->
            <template v-if="formData.fieldConfig.widget === 'uploadWidget'">
              <pc-form-item label="最大数量">
                <pc-input-number v-model="formData.fieldConfig.maxCount" :min="1"></pc-input-number>
              </pc-form-item>
              
              <pc-form-item label="最大大小(字节)">
                <pc-input-number v-model="formData.fieldConfig.maxSize" :min="0"></pc-input-number>
              </pc-form-item>
              
              <pc-form-item label="文件类型">
                <pc-input v-model="formData.fieldConfig.fileTypes" placeholder="例如: jpeg,jpg,png,pdf"></pc-input>
              </pc-form-item>
              
              <pc-form-item label="按钮文本">
                <pc-input v-model="formData.fieldConfig.buttonText" placeholder="例如: 点击上传"></pc-input>
              </pc-form-item>
            </template>
          </template>
        </template>

        <!-- 自定义HR属性配置部分，通用于区块和字段，放置在表单最后 -->
        <div class="group-title">自定义HR属性配置</div>
        <pc-form-item label="开发者扩展属性">
          <div class="tips-text hr-tips-text">添加hr开头的自定义属性，用于开发者在特殊组件中实现个性化功能</div>
          <div class="hr-property-container">
            <div v-for="(prop, index) in hrProperties" :key="index" class="hr-property-item">
              <div class="hr-property-label">hr</div>
              <pc-input 
                v-model="prop.key" 
                placeholder="属性名" 
                class="hr-property-key"
                @input="validateHrKey(index)"
              ></pc-input>
              <pc-input 
                type="textarea" 
                v-model="prop.value" 
                placeholder="值 (支持JSON格式: null, [], {}, 字符串等)" 
                class="hr-property-value"
              ></pc-input>
              <pc-button 
                type="danger" 
                icon="el-icon-delete" 
                circle 
                @click="removeHrProperty(index)"
              ></pc-button>
            </div>
            <pc-button type="primary" @click="addHrProperty" plain>添加HR属性</pc-button>
          </div>
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
import { getConfigByType, BlockConfig } from './configData.js'

export default {
  name: 'ConfigDrawer',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    configType: {
      type: String,
      default: 'field', // 'field' 或 'block'
      validator: value => ['field', 'block'].includes(value)
    },
    componentType: {
      type: String,
      default: ''
    },
    currentConfig: {
      type: Object,
      default: () => ({})
    },
    cursor: {
      type: Object,
      default: null
    },
    formConfigStr: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visibleSync: this.visible,
      formData: {
        code: '',
        config: {
          title: ''
        },
        blockConfig: {
          canBeFolded: true,
          hrBlockType: 'normal'
        },
        fieldConfig: {}
      },
      fieldComponentType: 'inputText',
      apiParamsString: '{}',
      hrProperties: []
    }
  },
  watch: {
    visible(val) {
      this.visibleSync = val
      if (val) {
        this.initFormData()
      }
    },
    componentType(val) {
      if (val && this.configType === 'field') {
        this.fieldComponentType = val
        this.initFieldConfig()
      }
    },
    fieldComponentType(val) {
      if (val && this.configType === 'field') {
        this.initFieldConfig()
      }
    },
    'formData.fieldConfig.type'(val) {
      // 确保组件类型和字段类型匹配
      if (val === 'string') {
        if (!['inputText', 'selectSimple', 'selectRemote', 'datePicker', 'areaSelector'].includes(this.fieldComponentType)) {
          this.fieldComponentType = 'inputText'
        }
      } else if (val === 'number') {
        this.fieldComponentType = 'inputNumber'
      } else if (val === 'Array') {
        this.fieldComponentType = 'upload'
        this.formData.fieldConfig.widget = 'uploadWidget'
      }
    }
  },
  methods: {
    // 初始化表单数据
    initFormData() {
      try {
        if (this.configType === 'block') {
          // 初始化区块配置
          this.formData = {
            code: '',
            config: {
              title: BlockConfig.title,
              properties: {}
            },
            blockConfig: {
              canBeFolded: BlockConfig.canBeFolded,
              hrBlockType: BlockConfig.hrBlockType
            }
          }
        } else {
          // 初始化字段配置
          this.formData = {
            code: '',
            fieldConfig: {}
          }
          this.initFieldConfig()
        }
        
        // 初始化HR属性列表
        this.hrProperties = []
        
        // 如果有现有配置，查找并加载HR属性
        if (this.currentConfig) {
          // 查找现有的HR属性 (对于block或field配置)
          const configObj = this.configType === 'block' ? this.currentConfig.blockConfig : this.currentConfig.fieldConfig
          
          if (configObj) {
            Object.keys(configObj).forEach(key => {
              if (key.startsWith('hr')) {
                const value = configObj[key]
                let displayValue = value
                
                // 对象和数组类型转为JSON字符串以便编辑
                if (value !== null && typeof value === 'object') {
                  displayValue = JSON.stringify(value, null, 2)
                }
                
                this.hrProperties.push({
                  key: key.substring(2), // 去掉hr前缀
                  value: displayValue
                })
              }
            })
          }
        }
      } catch (e) {
        console.error('初始化表单数据时出错:', e)
        // 使用兜底默认值
        if (this.configType === 'block') {
          this.formData = {
            code: '',
            config: {
              title: '默认区块',
              properties: {}
            },
            blockConfig: {
              canBeFolded: true,
              hrBlockType: 'normal'
            }
          }
        } else {
          // 字段配置兜底
          this.formData = {
            code: '',
            fieldConfig: {
              title: '默认字段',
              type: 'string',
              placeholder: '请输入'
            }
          }
        }
        
        // 显示错误消息
        this.$message.warning('配置初始化遇到问题，已使用默认配置')
      }
    },
    
    // 添加HR属性
    addHrProperty() {
      this.hrProperties.push({
        key: '',
        value: ''
      })
    },
    
    // 移除HR属性
    removeHrProperty(index) {
      this.hrProperties.splice(index, 1)
    },
    
    // 验证HR属性key
    validateHrKey(index) {
      const prop = this.hrProperties[index]
      // 移除开头可能已存在的hr前缀
      if (prop.key.startsWith('hr')) {
        prop.key = prop.key.substring(2)
      }
      // 确保key不为空
      if (!prop.key) {
        prop.key = ''
      }
    },
    
    // 处理HR属性值 - 将字符串转换为实际类型数据
    processHrPropertyValue(prop) {
      if (!prop.value || prop.value.trim() === '') {
        return ''
      }
      
      try {
        // 尝试解析为JSON对象
        return JSON.parse(prop.value)
      } catch (error) {
        // 如果不是有效的JSON，则保留为字符串
        return prop.value
      }
    },
    
    // 初始化字段配置
    initFieldConfig() {
      try {
        // 根据组件类型获取默认配置
        const defaultConfig = getConfigByType(this.fieldComponentType)
        
        // 清理并合并配置
        if (this.fieldComponentType === 'selectRemote' && defaultConfig.enumApiParams) {
          this.apiParamsString = JSON.stringify(defaultConfig.enumApiParams, null, 2)
        }
        
        // 如果是省市区选择器，确保设置了widget属性
        if (this.fieldComponentType === 'areaSelector') {
          defaultConfig.widget = 'AreaWidget'
          
          // 如果在表单配置页面，从外部传入当前块的Key
          if (this.cursor && this.cursor.blockKey) {
            defaultConfig.bindBlock = this.cursor.blockKey
          }
          
          // 移除任何可能存在的 ui: 前缀属性
          Object.keys(defaultConfig).forEach(key => {
            if (key.startsWith('ui:')) {
              delete defaultConfig[key]
            }
          })
        }
        
        this.formData.fieldConfig = { ...defaultConfig }
      } catch (e) {
        console.error('初始化字段配置时出错:', e)
        // 使用基础配置作为兜底
        this.formData.fieldConfig = {
          title: '默认字段',
          type: 'string',
          emptyValue: '',
          required: false,
          requiredMessage: '此项为必填项',
          disabled: false,
          hidden: false,
          placeholder: '请输入'
        }
      }
    },
    
    // 更新API参数
    updateApiParams(val) {
      try {
        const params = JSON.parse(val)
        this.formData.fieldConfig.enumApiParams = params
      } catch (e) {
        // 保留用户输入，但不更新参数对象
        console.error('API参数解析错误:', e)
      }
    },
    
    // 处理关闭
    handleClose() {
      this.visibleSync = false
      this.$emit('close')
      this.$emit('update:visible', false)
    },
    
    // 处理提交
    handleSubmit() {
      // 表单验证
      this.$refs.configForm.validate(valid => {
        if (!valid) {
          this.$message.error('请检查表单必填项')
          return
        }
        
        // 根据类型清理不必要的配置
        let submitData = { ...this.formData }
        
        if (this.configType === 'field') {
          // 根据字段类型清理不相关的属性
          this.cleanFieldConfig(submitData.fieldConfig)
          
          // 处理HR属性 - 添加到fieldConfig
          this.hrProperties.forEach(prop => {
            // 只处理有key和value的属性
            if (prop.key && (prop.value !== undefined && prop.value !== null)) {
              // 添加hr前缀
              const hrKey = 'hr' + prop.key;
              submitData.fieldConfig[hrKey] = this.processHrPropertyValue(prop)
            }
          })
        } else if (this.configType === 'block') {
          // 处理HR属性 - 添加到blockConfig
          this.hrProperties.forEach(prop => {
            // 只处理有key和value的属性
            if (prop.key && (prop.value !== undefined && prop.value !== null)) {
              // 添加hr前缀
              const hrKey = 'hr' + prop.key;
              submitData.blockConfig[hrKey] = this.processHrPropertyValue(prop)
            }
          })
        }
        
        // 提交数据
        this.$emit('submit', submitData)
        this.handleClose()
      })
    },
    
    // 清理字段配置中不相关的属性
    cleanFieldConfig(config) {
      // 处理选择器类型
      if (config.type === 'string') {
        if (this.fieldComponentType === 'inputText') {
          // 清除选择器相关属性
          delete config.enumDict
          delete config.enumApi
          delete config.enumApiParams
          delete config.allowClear
          delete config.mode
          delete config.widget
          delete config.format
          delete config.showTime
          delete config.disablePast
          delete config.disableFuture
          delete config.bindBlock
          delete config.bindCode
        } else if (this.fieldComponentType === 'selectSimple') {
          // 清除其他类型的属性
          delete config.pattern
          delete config.patternMessage
          delete config.maxLength
          delete config.enumApi
          delete config.enumApiParams
          delete config.widget
          delete config.format
          delete config.showTime
          delete config.disablePast
          delete config.disableFuture
          delete config.bindBlock
          delete config.bindCode
        } else if (this.fieldComponentType === 'selectRemote') {
          // 清除其他类型的属性
          delete config.pattern
          delete config.patternMessage
          delete config.maxLength
          delete config.enumDict
          delete config.widget
          delete config.format
          delete config.showTime
          delete config.disablePast
          delete config.disableFuture
          delete config.bindBlock
          delete config.bindCode
        } else if (this.fieldComponentType === 'datePicker') {
          // 清除其他类型的属性
          delete config.pattern
          delete config.patternMessage
          delete config.maxLength
          delete config.enumDict
          delete config.enumApi
          delete config.enumApiParams
          delete config.allowClear
          delete config.mode
          delete config.bindBlock
          delete config.bindCode
        } else if (this.fieldComponentType === 'areaSelector') {
          // 清除其他类型的属性
          delete config.pattern
          delete config.patternMessage
          delete config.maxLength
          delete config.enumDict
          delete config.enumApi
          delete config.enumApiParams
          delete config.allowClear
          delete config.mode
          delete config.format
          delete config.showTime
          delete config.disablePast
          delete config.disableFuture
        }
      } else if (config.type === 'number') {
        // 清除字符串和数组相关属性
        delete config.pattern
        delete config.patternMessage
        delete config.maxLength
        delete config.enumDict
        delete config.enumApi
        delete config.enumApiParams
        delete config.allowClear
        delete config.mode
        delete config.format
        delete config.showTime
        delete config.disablePast
        delete config.disableFuture
        delete config.maxCount
        delete config.maxSize
        delete config.fileTypes
        delete config.buttonText
        delete config.bindBlock
        delete config.bindCode
      } else if (config.type === 'Array') {
        // 清除字符串和数字相关属性
        delete config.pattern
        delete config.patternMessage
        delete config.maxLength
        delete config.enumDict
        delete config.enumApi
        delete config.enumApiParams
        delete config.allowClear
        delete config.mode
        delete config.format
        delete config.showTime
        delete config.disablePast
        delete config.disableFuture
        delete config.min
        delete config.max
        delete config.step
        delete config.precision
        delete config.bindBlock
        delete config.bindCode
      }
    }
  }
}
</script>

<style scoped>
.drawer-content {
  height: 100%;
  overflow-y: auto;
  padding: 0 20px;
}

.drawer-footer {
  margin-top: 20px;
  text-align: right;
  padding: 10px 0;
  border-top: 1px solid #ebeef5;
  background-color: #fff;
}

.drawer-footer button {
  margin-left: 10px;
}

/* 分组标题 */
.group-title {
  margin: 15px 0 5px;
  padding-bottom: 5px;
  border-bottom: 1px solid #ebeef5;
  font-weight: bold;
  color: #606266;
  font-size: 14px;
}

/* 表单项间距 */
::v-deep .pc-form-item {
  margin-bottom: 15px;
}

.tips-text {
  font-size: 0.8em;
  color: #909399;
  margin-top: 5px;
}

/* HR属性相关样式 */
.hr-property-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.hr-property-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border: 1px dashed #e0e0e0;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.hr-property-key {
  width: 25%;
}

.hr-property-value {
  flex: 1;
  min-height: 60px;
}

.hr-property-label {
  display: flex;
  align-items: center;
  color: #409EFF;
  font-weight: bold;
  font-size: 14px;
  width: auto;
  margin-right: 5px;
}

/* HR属性分组标题特殊样式 */
.group-title:last-of-type {
  margin-top: 25px;
  color: #409EFF;
  background-color: #ecf5ff;
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 3px solid #409EFF;
  font-size: 15px;
}

/* HR属性提示文本 */
.hr-tips-text {
  color: #67c23a;
  font-size: 0.9em;
  margin-bottom: 10px;
  font-style: italic;
}
</style> 