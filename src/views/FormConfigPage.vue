<template>
  <div class="config-editor">
    <h2>表单配置</h2>
    
    <!-- 添加拖拽组件区域 -->
    <div class="component-panel">
      <h3>配置字段</h3>
      <div class="field-components">
        <div 
          v-for="(component, index) in fieldComponents" 
          :key="index" 
          class="field-component-tag"
          draggable="true"
          @dragstart="onDragStart($event, component)"
        >
          {{ component.title }}
        </div>
      </div>
    </div>
    
    <!-- 区块配置拖拽按钮 -->
    <div class="component-panel">
      <h3>区块配置</h3>
      <div class="field-component-tag block-tag"
        draggable="true"
        @dragstart="onDragStart($event, {title: '区块配置', type: 'block'})"
      >
        添加区块
      </div>
    </div>
    
    <pc-card class="box-card">
      <div 
        ref="dropZone"
        class="drop-zone-container"
        @dragover.prevent="handleDragOver"
        @dragenter.prevent="handleDragEnter"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="onDrop"
        :data-mode="isEditMode ? '编辑模式' : '拖拽模式'"
      >
        <codemirror
          v-model="formConfigStr"
          :options="cmOptions"
          @input="updateFormConfig"
          ref="cmEditor"
          @dragover="isEditMode ? null : preventCodeMirrorEvent"
          @dragenter="isEditMode ? null : preventCodeMirrorEvent" 
          @drop="isEditMode ? null : preventCodeMirrorEvent"
        ></codemirror>
      </div>
      <div class="actions">
        <pc-button type="primary" @click="validateAndApply" :loading="loading">验证并应用</pc-button>
        <pc-button type="text" @click="autoFixJSON" title="尝试自动修复JSON语法错误">修复格式</pc-button>
        <pc-switch
          v-model="isEditMode"
          active-text="编辑模式"
          inactive-text="拖拽模式"
          @change="toggleEditMode"
        ></pc-switch>
      </div>
    </pc-card>
    
    <!-- 使用配置抽屉组件 -->
    <config-drawer
      :visible.sync="configDrawerVisible"
      :configType="currentConfigType"
      :componentType="currentComponentType"
      :currentConfig="currentFieldConfig"
      :cursor="insertPosition"
      :formConfigStr="formConfigStr"
      @close="handleDrawerClose"
      @submit="handleDrawerSubmit"
    ></config-drawer>
  </div>
</template>

<script>
import { formConfig } from './formView/index.js'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/idea.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/selection/active-line.js'
import renderJsonSchemaAsync from '@/utils/transformSchema'
import EventBus from '@/utils/eventBus'
import ConfigDrawer from '@/components/ConfigDrawer.vue'

export default {
  name: 'FormConfigPage',
  components: {
    codemirror,
    ConfigDrawer
  },
  data() {
    return {
      formConfigStr: JSON.stringify(formConfig, null, 2),
      cmOptions: {
        tabSize: 2,
        mode: 'application/json',
        theme: 'idea',
        lineNumbers: true,
        line: true,
        lineWrapping: true,
        matchBrackets: true,
        styleActiveLine: true,
        dragDrop: false, // 禁用CodeMirror的拖放功能
        allowDropFileTypes: [], // 不允许任何类型的文件拖放
        readOnly: true, // 默认为只读模式，禁止编辑
      },
      isEditMode: false, // 默认处于拖拽模式
      lastValidConfig: null,
      loading: false,
      retryCount: 0,
      
      // 拖拽相关
      fieldComponents: [
        { title: '文本输入框', type: 'inputText' },
        { title: '数字输入框', type: 'inputNumber' },
        { title: '选择器', type: 'selectSimple' },
        { title: '远程选择器', type: 'selectRemote' },
        { title: '日期选择器', type: 'datePicker' },
        { title: '省市区选择器', type: 'areaSelector' },
        { title: '文件上传', type: 'upload' }
      ],
      draggedComponent: null,
      dropPosition: null,
      currentDragBlockContext: null, // 拖拽开始时的区块上下文
      
      // 抽屉组件相关
      configDrawerVisible: false,
      currentConfigType: 'field',  // 'field' 或 'block'
      currentComponentType: '',
      currentFieldConfig: {},
      
      // 字段标识符
      blockKey: '',
      fieldKey: '',
      insertPosition: null,
      isDragging: false
    }
  },
  mounted() {
    // 输出调试信息
    console.log('组件挂载完成')
    console.log('ConfigDrawer组件是否已注册:', !!this.$options.components.ConfigDrawer)
    
    // 在nextTick中获取DOM元素
    this.$nextTick(() => {
      // 检查drop-zone元素
      if (this.$refs.dropZone) {
        console.log('拖放区域元素已找到')
      } else {
        console.error('无法找到拖放区域元素')
      }
      
      // 检查codemirror
      if (this.$refs.cmEditor && this.$refs.cmEditor.codemirror) {
        console.log('CodeMirror已初始化')
        
        // 直接访问CodeMirror实例
        const cm = this.$refs.cmEditor.codemirror
        
        // 确保CodeMirror处于正确的模式
        cm.setOption('readOnly', !this.isEditMode)
        
        // 仅在拖拽模式下添加事件监听
        if (!this.isEditMode) {
          console.log('初始化为拖拽模式，添加拖拽事件监听器')
          // 获取CodeMirror的DOM元素
          const cmElement = cm.getWrapperElement()
          
          // 为CodeMirror的DOM元素添加原生事件监听，使用捕获阶段拦截事件
          cmElement.addEventListener('dragover', this.preventCodeMirrorNativeEvent, true)
          cmElement.addEventListener('dragenter', this.preventCodeMirrorNativeEvent, true)
          cmElement.addEventListener('drop', this.preventCodeMirrorNativeEvent, true)
        } else {
          console.log('初始化为编辑模式，允许直接编辑')
        }
      } else {
        console.error('CodeMirror初始化失败')
      }
    })
  },
  beforeDestroy() {
    // 移除事件监听器，避免内存泄漏
    if (this.$refs.cmEditor && this.$refs.cmEditor.codemirror) {
      const cmElement = this.$refs.cmEditor.codemirror.getWrapperElement()
      
      // 无论当前是什么模式，都移除所有事件监听器
      cmElement.removeEventListener('dragover', this.preventCodeMirrorNativeEvent, true)
      cmElement.removeEventListener('dragenter', this.preventCodeMirrorNativeEvent, true)
      cmElement.removeEventListener('drop', this.preventCodeMirrorNativeEvent, true)
    }
    
    // 清理工作
    console.log('组件即将销毁，清理资源')
  },
  methods: {
    // 切换编辑/拖拽模式
    toggleEditMode(isEditMode) {
      // 获取 CodeMirror 实例
      const cm = this.$refs.cmEditor.codemirror;
      const cmElement = cm.getWrapperElement();
      
      if (isEditMode) {
        // 进入编辑模式
        cm.setOption('readOnly', false);
        this.$message.info('已进入编辑模式，拖拽功能已禁用');
        
        // 移除拖拽相关事件处理
        cmElement.removeEventListener('dragover', this.preventCodeMirrorNativeEvent, true);
        cmElement.removeEventListener('dragenter', this.preventCodeMirrorNativeEvent, true);
        cmElement.removeEventListener('drop', this.preventCodeMirrorNativeEvent, true);
        
        // 确保拖拽状态被清除
        this.isDragging = false;
        if (this.$refs.dropZone) {
          this.$refs.dropZone.classList.remove('drag-over');
        }
      } else {
        // 进入拖拽模式
        cm.setOption('readOnly', true);
        this.$message.info('已进入拖拽模式，可以拖拽字段到编辑区');
        
        // 重新添加拖拽相关事件处理
        cmElement.addEventListener('dragover', this.preventCodeMirrorNativeEvent, true);
        cmElement.addEventListener('dragenter', this.preventCodeMirrorNativeEvent, true);
        cmElement.addEventListener('drop', this.preventCodeMirrorNativeEvent, true);
      }
      
      // 每次切换模式后，让编辑器重新获取焦点
      this.$nextTick(() => {
        cm.refresh();
        cm.focus();
      });
    },
    
    updateFormConfig(newValue) {
      try {
        // 解析JSON并通过EventBus发送更新的配置
        const parsedConfig = JSON.parse(newValue)
        // 存储最后一次有效的配置
        this.lastValidConfig = parsedConfig
      } catch (e) {
        // JSON解析错误，尝试修复然后再解析
        console.error('JSON解析错误:', e)
        
        // 检查是否是属性名没有双引号的错误
        if (e.message.includes('Expected double-quoted property name')) {
          console.log('检测到属性名未使用双引号，尝试自动修复...')
          try {
            // 尝试修复未引用的属性名
            const fixedJson = newValue.replace(/([{,]\s*)([a-zA-Z0-9_$]+)(\s*:)/g, '$1"$2"$3')
            
            // 重新尝试解析
            const parsedConfig = JSON.parse(fixedJson)
            
            // 如果成功，更新编辑器内容为修复后的内容并保存有效配置
            this.formConfigStr = fixedJson
            this.lastValidConfig = parsedConfig
            
            this.$message({
              message: '已自动修复JSON格式问题',
              type: 'success',
              duration: 2000
            })
          } catch (fixError) {
            // 如果修复尝试失败，记录日志
            console.error('自动修复失败:', fixError)
          }
        }
      }
    },
    
    // 辅助方法 - 验证并修复JSON格式
    validateAndSanitizeJSON(jsonStr) {
      try {
        // 尝试直接解析
        return { valid: true, data: JSON.parse(jsonStr) };
      } catch (e) {
        console.error('JSON验证失败:', e);
        
        try {
          // 尝试通过字符串处理修复常见错误
          let fixedJson = jsonStr;
          let errorPosition = -1;
          let errorLine = -1;
          let errorColumn = -1;
          
          // 提取错误位置信息
          const errorMatch = e.message.match(/position\s+(\d+)(?:\s+\(line\s+(\d+)\s+column\s+(\d+)\))?/);
          if (errorMatch) {
            errorPosition = parseInt(errorMatch[1]);
            errorLine = parseInt(errorMatch[2]);
            errorColumn = parseInt(errorMatch[3]);
            console.log(`JSON错误位置: 位置 ${errorPosition}, 行 ${errorLine}, 列 ${errorColumn}`);
            
            // 提取错误行附近内容用于日志
            const lines = fixedJson.split('\n');
            if (errorLine > 0 && errorLine <= lines.length) {
              const lineIndex = errorLine - 1; // 转为0-based索引
              
              // 显示错误行和前后几行，帮助理解上下文
              const context = [];
              for (let i = Math.max(0, lineIndex - 2); i <= Math.min(lines.length - 1, lineIndex + 2); i++) {
                context.push(`${i+1}: ${lines[i]}`);
              }
              console.log('错误上下文:\n' + context.join('\n'));
              
              // 检查具体的错误行
              if (lines[lineIndex]) {
                console.log(`错误行内容: "${lines[lineIndex]}"`);
                
                // 具体定位错误位置
                if (errorColumn > 0) {
                  const pointer = ' '.repeat(errorColumn - 1) + '^';
                  console.log(`错误位置指示: ${pointer}`);
                  
                  // 检查是否是Expected property name or '}'错误 (可能是多余的逗号)
                  if (e.message.includes("Expected property name or '}'")) {
                    // 检查前一个字符是否是逗号，这通常表示尾随逗号
                    if (errorColumn > 1 && lines[lineIndex][errorColumn - 2] === ',') {
                      console.log('错误类型: 对象尾随逗号');
                      // 删除多余的逗号
                      const newLine = lines[lineIndex].substring(0, errorColumn - 2) + 
                                     lines[lineIndex].substring(errorColumn - 1);
                      lines[lineIndex] = newLine;
                      fixedJson = lines.join('\n');
                      console.log(`修复后的行: "${newLine}"`);
                    }
                  }
                  
                  // 检查是否是"Expected ',' or '}' after property value"错误
                  // 这通常是属性值后缺少逗号或者右花括号
                  if (e.message.includes("Expected ',' or '}' after property value")) {
                    console.log('错误类型: 属性值后缺少逗号或右大括号');
                    
                    // 检查错误行中的问题位置
                    const lineBeforeError = lines[lineIndex].substring(0, errorColumn - 1);
                    const lineAfterError = lines[lineIndex].substring(errorColumn - 1);
                    
                    // 检查是否是缺少逗号或右大括号的问题
                    const valueEndMatch = lineBeforeError.match(/("[^"]*"|true|false|null|\d+(?:\.\d+)?)([^,}\s]*)$/);
                    if (valueEndMatch) {
                      const value = valueEndMatch[1];
                      const invalidChars = valueEndMatch[2];
                      console.log(`值 "${value}" 后面发现无效字符 "${invalidChars}"`);
                      
                      // 修复问题：通常是添加逗号，或者去除无效字符
                      if (lineAfterError.trim().startsWith('{') || lineAfterError.trim().startsWith('[')) {
                        // 如果后面是开始一个新的对象或数组，需要逗号
                        const newLine = lineBeforeError.replace(/([^,{[]\s*)$/, '$1, ') + lineAfterError;
                        lines[lineIndex] = newLine;
                        console.log(`添加逗号分隔符，修复后的行: "${newLine}"`);
                      } else if (lineAfterError.trim().startsWith('"')) {
                        // 如果后面是一个新的字符串键，需要逗号和可能的右括号
                        const newLine = lineBeforeError + ', ' + lineAfterError;
                        lines[lineIndex] = newLine;
                        console.log(`添加逗号分隔符，修复后的行: "${newLine}"`);
                      } else {
                        // 移除无效字符，通常是后面紧跟着键或值的情况
                        // 寻找下一个合法的分隔符位置
                        let validSeparatorPos = lineAfterError.search(/[,}\]]/);
                        if (validSeparatorPos >= 0) {
                          // 移除值和有效分隔符之间的无效字符
                          const newLine = lineBeforeError + lineAfterError.substring(validSeparatorPos);
                          lines[lineIndex] = newLine;
                          console.log(`移除无效字符，修复后的行: "${newLine}"`);
                        } else {
                          // 如果找不到分隔符，尝试添加逗号
                          const newLine = lineBeforeError + ', ' + lineAfterError;
                          lines[lineIndex] = newLine;
                          console.log(`添加逗号，修复后的行: "${newLine}"`);
                        }
                      }
                      
                      fixedJson = lines.join('\n');
                    }
                  }
                }
                
                // 针对特定错误类型进行定向修复
                if (e.message.includes('Expected double-quoted property name')) {
                  console.log('错误类型: 属性名缺少双引号');
                  // 尝试直接修复这一行
                  const fixedLine = lines[lineIndex].replace(/([{,]\s*)([a-zA-Z0-9_$]+)(\s*:)/g, '$1"$2"$3');
                  lines[lineIndex] = fixedLine;
                  fixedJson = lines.join('\n');
                  console.log(`修复后的行: "${fixedLine}"`);
                }
              }
            }
          }
          
          // 应用全局修复规则
          
          // 1. 修复未引用的属性名 (更强的匹配模式)
          fixedJson = fixedJson.replace(/([{,]\s*)([a-zA-Z0-9_$]+)(\s*:)/g, '$1"$2"$3');
          
          // 2. 修复单引号错误
          fixedJson = fixedJson.replace(/([{,]\s*)'([^']+)'(\s*:)/g, '$1"$2"$3');
          fixedJson = fixedJson.replace(/:\s*'([^']+?)'/g, ':"$1"');
          
          // 3. 修复多余的逗号 (增强版本 - 处理更多情况)
          fixedJson = fixedJson.replace(/,(\s*[}\]])/g, '$1'); // 标准尾随逗号
          fixedJson = fixedJson.replace(/,\s*,/g, ','); // 重复逗号
          fixedJson = fixedJson.replace(/:\s*,/g, ':null,'); // 空属性值
          fixedJson = fixedJson.replace(/{\s*,/g, '{'); // 对象开始位置的逗号
          fixedJson = fixedJson.replace(/\[\s*,/g, '['); // 数组开始位置的逗号
          
          // 4. 修复缺少逗号的情况
          fixedJson = fixedJson.replace(/("[^"]*"|true|false|null|\d+(?:\.\d+)?)\s+("[^"]*")/g, '$1, $2');  // 值与键之间缺少逗号
          fixedJson = fixedJson.replace(/}(\s*{)/g, '}, $1');  // 对象之间缺少逗号
          fixedJson = fixedJson.replace(/](\s*\[)/g, '], $1');  // 数组之间缺少逗号
          fixedJson = fixedJson.replace(/}(\s*\[)/g, '}, $1');  // 对象后面是数组缺少逗号
          fixedJson = fixedJson.replace(/](\s*{)/g, '], $1');  // 数组后面是对象缺少逗号
          
          // 5. 修复布尔值和空值
          fixedJson = fixedJson.replace(/:\s*True\b/gi, ':true');
          fixedJson = fixedJson.replace(/:\s*False\b/gi, ':false');
          fixedJson = fixedJson.replace(/:\s*None\b/gi, ':null');
          
          // 6. 修复未引用的字符串值
          fixedJson = fixedJson.replace(/:\s*([a-zA-Z0-9_$]+)([,}\]])/g, ':"$1"$2');
          
          // 7. 修复特殊字符和换行符
          fixedJson = fixedJson.replace(/([^\\])\\([^\\"])/g, '$1\\\\$2');
          fixedJson = fixedJson.replace(/"\s*\+\s*"/g, '');
          
          // 8. 修复格式错误的JSON片段 (例如连续的冒号或键没有值)
          fixedJson = fixedJson.replace(/:\s*:/g, ':null:'); // 连续冒号
          fixedJson = fixedJson.replace(/"[^"]*"(\s*[}\]])/g, '"$1":null$2'); // 键后面缺少值
          
          // 9. 修复属性值后面缺少正确分隔符的情况
          fixedJson = fixedJson.replace(/("[^"]*"|true|false|null|\d+(?:\.\d+)?)\s*([^,}\]:])([^"0-9a-zA-Z_])/g, '$1$3');
          
          // 10. 尝试修复不配对的括号
          const openBraces = (fixedJson.match(/\{/g) || []).length;
          const closeBraces = (fixedJson.match(/\}/g) || []).length;
          if (openBraces > closeBraces) {
            fixedJson = fixedJson + '}'.repeat(openBraces - closeBraces);
            console.log(`添加了 ${openBraces - closeBraces} 个缺失的右大括号`);
          } else if (closeBraces > openBraces) {
            // 移除多余的右大括号
            let excessBraces = closeBraces - openBraces;
            let tempJson = fixedJson;
            while (excessBraces > 0 && tempJson.lastIndexOf('}') !== -1) {
              const lastBracePos = tempJson.lastIndexOf('}');
              tempJson = tempJson.substring(0, lastBracePos) + tempJson.substring(lastBracePos + 1);
              excessBraces--;
            }
            fixedJson = tempJson;
            console.log(`移除了 ${closeBraces - openBraces} 个多余的右大括号`);
          }
          
          const openBrackets = (fixedJson.match(/\[/g) || []).length;
          const closeBrackets = (fixedJson.match(/\]/g) || []).length;
          if (openBrackets > closeBrackets) {
            fixedJson = fixedJson + ']'.repeat(openBrackets - closeBrackets);
            console.log(`添加了 ${openBrackets - closeBrackets} 个缺失的右中括号`);
          } else if (closeBrackets > openBrackets) {
            // 移除多余的右中括号
            let excessBrackets = closeBrackets - openBrackets;
            let tempJson = fixedJson;
            while (excessBrackets > 0 && tempJson.lastIndexOf(']') !== -1) {
              const lastBracketPos = tempJson.lastIndexOf(']');
              tempJson = tempJson.substring(0, lastBracketPos) + tempJson.substring(lastBracketPos + 1);
              excessBrackets--;
            }
            fixedJson = tempJson;
            console.log(`移除了 ${closeBrackets - openBrackets} 个多余的右中括号`);
          }
          
          console.log('尝试修复后的JSON:', fixedJson);
          
          // 尝试解析修复后的JSON
          try {
            const fixedData = JSON.parse(fixedJson);
            return { valid: true, data: fixedData, fixed: true, fixedJson };
          } catch (innerError) {
            console.error('第一阶段修复失败:', innerError);
            
            // 第二阶段修复: 更激进的修复尝试
            // 如果常规修复失败，尝试更激进的方法
            
            // 尝试修复不平衡的引号
            fixedJson = this.balanceQuotes(fixedJson);
            
            // 尝试转义未转义的控制字符
            fixedJson = fixedJson.replace(/[\u0000-\u001F]/g, match => {
              return '\\u' + ('0000' + match.charCodeAt(0).toString(16)).slice(-4);
            });
            
            // 修复Unicode转义
            fixedJson = fixedJson.replace(/\\u([0-9a-fA-F]{2})([0-9a-fA-F]{2})/g, '\\u$1$2');
            
            // 尝试修复键-值格式错误
            if (errorPosition > 0) {
              // 尝试修复常见的格式问题
              const segments = fixedJson.split('\n');
              for (let i = 0; i < segments.length; i++) {
                // 尝试修复缺少值的键
                segments[i] = segments[i].replace(/("[^"]*")(\s*)$/g, '$1: null');
                
                // 尝试修复没有键的值
                segments[i] = segments[i].replace(/^(\s*)(:)(.+)$/g, '$1"missingKey"$2$3');
                
                // 尝试修复缺少逗号的属性
                segments[i] = segments[i].replace(/("[^"]*"|true|false|null|\d+(?:\.\d+)?)\s+("[^"]*")/g, '$1, $2');
                
                // 检查是否有不成对的括号
                const openCount = (segments[i].match(/\{/g) || []).length;
                const closeCount = (segments[i].match(/\}/g) || []).length;
                if (openCount > closeCount) {
                  segments[i] = segments[i] + '}'.repeat(openCount - closeCount);
                }
              }
              fixedJson = segments.join('\n');
              
              // 如果以上都失败，尝试最后的手段：根据错误位置直接修复
              const charBeforeError = fixedJson.charAt(errorPosition - 1);
              const charAtError = fixedJson.charAt(errorPosition);
              
              if (e.message.includes('Expected property name or')) {
                // 尝试修复尾随逗号或格式错误
                const beforeError = fixedJson.substring(0, errorPosition);
                const afterError = fixedJson.substring(errorPosition);
                
                // 检查是否是尾随逗号问题
                const trailingCommaMatch = beforeError.match(/,\s*$/);
                if (trailingCommaMatch) {
                  // 移除尾随逗号
                  fixedJson = beforeError.replace(/,\s*$/, '') + afterError;
                  console.log(`移除了位置 ${errorPosition} 处的尾随逗号`);
                } else if (charAtError === '}' || charAtError === ']') {
                  // 处理可能的空属性问题
                  const emptyPropMatch = beforeError.match(/("[^"]*")\s*:?\s*$/);
                  if (emptyPropMatch) {
                    // 为空属性添加null值
                    const propName = emptyPropMatch[1];
                    fixedJson = beforeError.replace(/("[^"]*")\s*:?\s*$/, '$1: null') + afterError;
                    console.log(`在属性 ${propName} 后添加了null值`);
                  }
                }
              } else if (e.message.includes('Expected double-quoted property name')) {
                const beforeError = fixedJson.substring(0, errorPosition);
                const afterError = fixedJson.substring(errorPosition);
                
                // 查找要修复的属性名
                const propNameMatch = afterError.match(/^([a-zA-Z0-9_$]+)(\s*:)/);
                if (propNameMatch) {
                  const fullMatch = propNameMatch[0];
                  const propName = propNameMatch[1];
                  const colon = propNameMatch[2];
                  
                  // 构建修复后的JSON
                  fixedJson = beforeError + '"' + propName + '"' + colon + afterError.substring(fullMatch.length);
                  console.log(`对位置 ${errorPosition} 进行直接修复`);
                }
              } else if (e.message.includes("Expected ',' or '}' after property value")) {
                // 这是属性值后面缺少逗号或右括号
                const beforeError = fixedJson.substring(0, errorPosition);
                const afterError = fixedJson.substring(errorPosition);
                
                // 查找后面的第一个有效分隔符
                const nextValidChar = afterError.search(/[,}\]]/);
                if (nextValidChar >= 0) {
                  // 如果找到有效分隔符，可能是值后面有无效字符
                  fixedJson = beforeError + afterError.substring(nextValidChar);
                  console.log(`在位置 ${errorPosition} 处移除了无效字符`);
                } else {
                  // 如果没有找到分隔符，尝试添加逗号
                  const valueEndMatch = beforeError.match(/("[^"]*"|true|false|null|\d+(?:\.\d+)?)([^,}\s]*)$/);
                  if (valueEndMatch) {
                    fixedJson = beforeError.replace(/([^,{[]\s*)$/, '$1, ') + afterError;
                    console.log(`在位置 ${errorPosition} 处添加了逗号`);
                  } else {
                    // 如果上面的方法都失败，尝试添加右括号
                    fixedJson = beforeError + '}' + afterError;
                    console.log(`在位置 ${errorPosition} 处添加了右括号`);
                  }
                }
              }
              
              console.log('第二阶段修复后的JSON:', fixedJson);
            }
            
            // 再次尝试解析
            const secondFixedData = JSON.parse(fixedJson);
            return { valid: true, data: secondFixedData, fixed: true, fixedJson };
          }
        } catch (fixError) {
          console.error('JSON修复失败:', fixError);
          // 修复失败
          return { valid: false, error: e.message, detailedError: fixError.message };
        }
      }
    },
    
    // 辅助方法：平衡JSON中的引号
    balanceQuotes(jsonStr) {
      let result = jsonStr;
      let inString = false;
      let escaping = false;
      let openQuoteIndex = -1;
      
      // 先尝试找出不平衡的引号
      for (let i = 0; i < jsonStr.length; i++) {
        const char = jsonStr.charAt(i);
        
        if (char === '\\' && !escaping) {
          escaping = true;
          continue;
        }
        
        if (char === '"' && !escaping) {
          if (!inString) {
            inString = true;
            openQuoteIndex = i;
          } else {
            inString = false;
            openQuoteIndex = -1;
          }
        }
        
        escaping = false;
      }
      
      // 如果找到未关闭的引号，尝试修复
      if (inString && openQuoteIndex >= 0) {
        console.log(`发现未关闭的引号，位置: ${openQuoteIndex}`);
        
        // 查找下一个可能的引号位置
        let closingPos = -1;
        for (let i = openQuoteIndex + 1; i < jsonStr.length; i++) {
          const char = jsonStr.charAt(i);
          // 找到逗号、右大括号或右中括号可能是引号缺失的位置
          if (char === ',' || char === '}' || char === ']') {
            closingPos = i;
            break;
          }
        }
        
        if (closingPos > openQuoteIndex) {
          result = jsonStr.substring(0, closingPos) + '"' + jsonStr.substring(closingPos);
          console.log(`在位置 ${closingPos} 添加引号`);
        } else {
          // 如果找不到合适的位置，就添加到末尾
          result = jsonStr + '"';
          console.log('在末尾添加引号');
        }
      }
      
      return result;
    },
    
    async validateAndApply() {
      if (this.loading) return

      // 每次点击按钮重置重试计数
      this.retryCount = 0
      
      // 验证当前配置
      const result = this.validateAndSanitizeJSON(this.formConfigStr, '')
      if (!result.valid) {
        this.$message({
          message: `配置无效: ${result.error}。请检查JSON格式，确保属性名使用双引号。`,
          type: 'error',
          duration: 5000,
          showClose: true
        })
        return
      }
      
      if (result.fixed) {
        // 更新修复后的配置
        this.formConfigStr = JSON.stringify(result.data, null, 2)
        this.$message({
          message: 'JSON格式已自动修复，请检查是否正确',
          type: 'warning',
          duration: 3000
        })
        
        // 高亮修复位置
        this.$nextTick(() => {
          if (this.$refs.cmEditor && this.$refs.cmEditor.codemirror) {
            const cm = this.$refs.cmEditor.codemirror
            cm.focus()
          }
        })
      }
      
      this.lastValidConfig = result.data
      
      // 发送配置更新事件
      EventBus.$emit('config-updated', this.lastValidConfig)
      
      // 使用异步方法转换为jsonSchema并发送更新事件
      await this.processSchemaWithRetry()
    },
    
    async processSchemaWithRetry() {
      this.loading = true
      try {
        // 显示加载状态
        this.$message({
          type: 'info',
          message: '正在处理配置和调用API...',
          duration: 1000
        })

        // 调用异步转换方法
        const jsonSchema = await renderJsonSchemaAsync(this.lastValidConfig)
        
        if (jsonSchema) {
          // 将处理后的schema发送到FormSchemaPage
          EventBus.$emit('schema-updated', jsonSchema)
          this.$message.success('配置已应用到表单')
        } else {
          this.$message.warning('无法生成有效的表单架构，请检查配置')
        }
      } catch (e) {
        console.error('Schema转换错误:', e)
        
        // 如果API调用失败，最多重试2次
        if (this.retryCount < 2) {
          this.retryCount++
          this.$message.warning(`API调用失败，正在尝试第${this.retryCount}次重试...`)
          
          // 等待1秒后重试
          setTimeout(() => {
            this.processSchemaWithRetry()
          }, 1000)
          return
        }
        
        this.$message.error('表单架构转换失败: ' + e.message)
      } finally {
        // 只有在不是重试的情况下才解除loading状态
        if (this.retryCount === 0 || this.retryCount >= 2) {
          this.loading = false
        }
      }
    },
    
    // 拖拽区域事件处理
    handleDragOver(event) {
      console.log('this.isEditMode', this.isEditMode)
      // 仅在拖拽模式下处理
      if (this.isEditMode) return;
      
      // 阻止默认行为，允许放置
      event.preventDefault()
      event.stopPropagation()
      
      // 设置放置效果为复制
      event.dataTransfer.dropEffect = 'copy'
      
      // 检查是否为有效的拖拽类型
      try {
        const isValidDrag = event.dataTransfer.types.includes('application/vantelement-component')
        if (isValidDrag) {
          // 可以在这里添加额外的视觉提示
        }
      } catch (e) {
        console.warn('检查拖拽类型失败:', e)
      }
    },
    
    handleDragEnter(event) {
      // 仅在拖拽模式下处理
      if (this.isEditMode) return;
      
      event.preventDefault()
      event.stopPropagation()
      
      // 添加拖拽高亮样式
      if (this.$refs.dropZone) {
        this.$refs.dropZone.classList.add('drag-over')
      }
      this.isDragging = true
    },
    
    handleDragLeave(event) {
      // 仅在拖拽模式下处理
      if (this.isEditMode) return;
      
      event.preventDefault()
      event.stopPropagation()
      
      // 检查是否真的离开了区域而不是进入子元素
      if (this.$refs.dropZone && !this.$refs.dropZone.contains(event.relatedTarget)) {
        this.$refs.dropZone.classList.remove('drag-over')
        this.isDragging = false
      }
    },
    
    onDrop(event) {
      // 仅在拖拽模式下处理
      if (this.isEditMode) return;
      
      console.log('拖拽项已释放', event.dataTransfer.types)
      event.preventDefault()
      event.stopPropagation() // 阻止事件传播
      
      // 移除拖拽高亮样式
      if (this.$refs.dropZone) {
        this.$refs.dropZone.classList.remove('drag-over')
      }
      this.isDragging = false
      
      // 获取拖放位置
      const cm = this.$refs.cmEditor.codemirror
      const coords = cm.coordsChar({
        left: event.clientX,
        top: event.clientY
      })
      
      // 保存放置位置
      this.insertPosition = coords
      
      // 分析放置位置的上下文内容
      const contextInfo = this.getPositionContext(coords, cm)
      console.log('放置位置上下文:', contextInfo)
      
      // 检查是否从一个区块拖到了另一个区块
      let crossBlockDrag = false
      if (this.currentDragBlockContext && 
          contextInfo.nearestBlock && 
          this.currentDragBlockContext !== contextInfo.nearestBlock) {
        crossBlockDrag = true
        console.log(`标签从区块 ${this.currentDragBlockContext} 拖到了区块 ${contextInfo.nearestBlock}`)
      }
      
      // 尝试从dataTransfer获取自定义类型数据
      let componentType
      let fullComponent
      try {
        // 尝试获取完整组件数据
        const fullComponentStr = event.dataTransfer.getData('application/vantelement-component-full')
        if (fullComponentStr) {
          fullComponent = JSON.parse(fullComponentStr)
          console.log('获取到完整组件数据:', fullComponent)
        }
        
        // 获取组件类型
        componentType = event.dataTransfer.getData('application/vantelement-component')
        console.log('获取到的组件类型:', componentType)
      } catch (e) {
        console.error('无法获取自定义类型数据:', e)
      }
      
      // 回退到文本数据
      if (!componentType) {
        try {
          componentType = event.dataTransfer.getData('text/plain')
          console.log('获取到的文本数据:', componentType)
        } catch (e) {
          console.error('无法获取文本数据:', e)
        }
      }
      
      // 如果拖拽过程完整，使用已保存的draggedComponent
      if (this.draggedComponent) {
        console.log('使用已保存的组件数据:', this.draggedComponent)
      } 
      // 或者使用从dataTransfer恢复的完整组件数据
      else if (fullComponent) {
        this.draggedComponent = fullComponent
        console.log('从完整数据恢复组件:', this.draggedComponent)
      }
      // 最后尝试根据类型查找组件
      else if (componentType && !componentType.match(/^\d+$/)) {
        this.draggedComponent = this.fieldComponents.find(c => c.type === componentType) || 
                            {type: componentType, title: '拖拽组件'}
        console.log('根据类型恢复组件:', this.draggedComponent)
      } else {
        console.error('无法恢复拖拽组件数据')
        
        // 调试：输出所有可用的数据类型和内容
        if (event.dataTransfer && event.dataTransfer.types) {
          console.log('所有可用的数据类型:', event.dataTransfer.types);
          event.dataTransfer.types.forEach(type => {
            try {
              console.log(`类型 ${type} 的数据:`, event.dataTransfer.getData(type));
            } catch (e) {
              console.log(`无法读取类型 ${type} 的数据:`, e);
            }
          });
        }
        
        // 尝试查看是否有任何可识别的组件类型
        const dragData = this.guessDraggedComponent(event);
        if (dragData) {
          this.draggedComponent = dragData;
          console.log('通过猜测识别组件:', this.draggedComponent);
        } else {
          this.$message.error('拖拽操作失败，请重试')
          return
        }
      }
      
      try {
        // 判断是区块配置还是字段配置
        if (this.draggedComponent.type === 'block') {
          this.currentConfigType = 'block'
          // 区块配置不需要更多信息，直接打开抽屉
          this.currentComponentType = ''
          this.currentFieldConfig = {}
        } else {
          this.currentConfigType = 'field'
          // 获取字段插入位置信息，使用上下文信息辅助决策
          this.getInsertPositionInfo(contextInfo)
          this.currentComponentType = this.draggedComponent.type
          
          // 如果是跨区块拖拽，显示特别提示
          if (crossBlockDrag) {
            this.$message({
              message: `字段将从 ${this.currentDragBlockContext} 区块移动到 ${contextInfo.nearestBlock} 区块`,
              type: 'warning',
              duration: 3000
            })
          }
        }
        
        // 在打开抽屉前添加日志确认
        console.log('准备打开配置抽屉:', {
          configType: this.currentConfigType,
          componentType: this.currentComponentType,
          draggedComponent: this.draggedComponent,
          blockKey: this.blockKey,
          crossBlockDrag: crossBlockDrag
        });
        
        // 直接设置配置抽屉为可见
        this.configDrawerVisible = true;
        
        // 确认抽屉已打开
        console.log('配置抽屉可见性:', this.configDrawerVisible);
      } catch (error) {
        console.error('处理拖放时出错:', error)
        this.$message.error('处理拖放时出错: ' + (error.message || '未知错误'))
        
        // 确保清理draggedComponent以避免后续错误
        this.draggedComponent = null
      }
      
      // 重置跨区块拖拽状态
      this.currentDragBlockContext = null
    },
    
    // 获取位置的上下文内容
    getPositionContext(position, cm) {
      const result = {
        currentLine: position.line,
        currentLineText: cm.getLine(position.line),
        surroundingLines: [],
        nearestBlock: null,
        inBlock: false,
        inProperties: false,
        blockStartLine: -1,
        blockEndLine: -1,
        lineCount: cm.lineCount()
      }
      
      // 收集前后5行的内容作为上下文
      const startLine = Math.max(0, position.line - 5)
      const endLine = Math.min(cm.lineCount() - 1, position.line + 5)
      
      for (let i = startLine; i <= endLine; i++) {
        result.surroundingLines.push({
          line: i,
          text: cm.getLine(i)
        })
      }
      
      // 分析当前行是否在区块内
      let foundBlock = false
      let blockKey = ''
      let inProperties = false
      let lineNum = position.line
      
      // 向上查找直到找到区块定义
      while (lineNum >= 0 && !foundBlock) {
        const line = cm.getLine(lineNum)
        
        // 检查是否是区块定义行
        const blockMatch = line.match(/"([A-Z0-9_]+)":\s*{/)
        if (blockMatch) {
          blockKey = blockMatch[1]
          foundBlock = true
          result.blockStartLine = lineNum
          result.nearestBlock = blockKey
          break
        }
        
        // 检查是否在properties对象内
        if (line.includes('"properties"')) {
          inProperties = true
        }
        
        // 检查是否离开了区块
        if (line.trim() === '},' || line.trim() === '}') {
          // 继续向上查找，看是否是区块的结束
          const prevLine = lineNum > 0 ? cm.getLine(lineNum - 1) : ''
          if (prevLine.includes('"properties"') || prevLine.includes('"hrBlockType"') || prevLine.includes('"canBeFolded"')) {
            // 可能已经离开了当前区块，继续向上查找
            lineNum--;
            continue
          }
        }
        
        lineNum--;
      }
      
      // 向下查找区块结束位置
      if (foundBlock) {
        lineNum = position.line
        let braceCount = 1  // 假设已经找到了开始的大括号
        
        while (lineNum < cm.lineCount() && braceCount > 0) {
          const line = cm.getLine(lineNum)
          
          // 计算大括号的开始和结束
          for (let i = 0; i < line.length; i++) {
            if (line[i] === '{') braceCount++
            if (line[i] === '}') braceCount--
            
            // 找到匹配的结束括号
            if (braceCount === 0) {
              result.blockEndLine = lineNum
              break
            }
          }
          
          lineNum++
        }
      }
      
      result.inBlock = foundBlock
      result.inProperties = inProperties
      
      return result
    },
    
    // 获取插入位置信息
    getInsertPositionInfo(contextInfo) {
      // 找到光标位置
      const cm = this.$refs.cmEditor.codemirror
      const cursor = this.insertPosition || cm.getCursor()
      const lineText = cm.getLine(cursor.line)
      
      console.log('当前行文本:', lineText)
      console.log('当前光标位置:', cursor)
      
      // 获取当前配置文本
      const formConfigText = this.formConfigStr
      
      // 尝试解析JSON配置
      try {
        const config = JSON.parse(formConfigText)
        
        // 检查格式是否符合预期
        if (!config.config) {
          // 创建基本结构
          this.createDefaultConfig()
          return // 返回，让用户重新尝试
        }
        
        // 确定目标区块
        let targetBlockKey = null;
        
        // 优先使用上下文分析的结果
        if (contextInfo && contextInfo.inBlock && contextInfo.nearestBlock) {
          // 首先检查上下文分析获取的区块是否存在于配置中
          if (config.config[contextInfo.nearestBlock]) {
            targetBlockKey = contextInfo.nearestBlock;
            console.log('使用上下文分析确定的区块:', targetBlockKey);
          }
        }
        
        // 如果上下文分析没有获取到有效区块，尝试使用光标位置确定
        if (!targetBlockKey) {
          // 分析光标位置关联的区块
          const { blockKey } = this.findBlockAndGenerateKey(config, cursor, lineText);
          
          // 如果找到了区块，使用它
          if (blockKey && config.config[blockKey]) {
            targetBlockKey = blockKey;
            console.log('使用光标位置确定的区块:', targetBlockKey);
          }
        }
        
        // 如果仍然没有确定区块，使用第一个可用的区块
        if (!targetBlockKey) {
          // 获取所有区块键（排除title等非区块字段）
          const blockKeys = Object.keys(config.config).filter(
            key => key !== 'title' && typeof config.config[key] === 'object'
          );
          
          // 如果有区块，使用第一个
          if (blockKeys.length > 0) {
            targetBlockKey = blockKeys[0];
            console.log('使用第一个可用区块:', targetBlockKey);
          } else {
            // 如果没有区块，创建一个默认区块
            this.createDefaultConfig();
            targetBlockKey = 'BLOCK01';
            console.log('创建默认区块:', targetBlockKey);
          }
        }
        
        // 设置确定的区块键和生成字段键
        this.blockKey = targetBlockKey;
        this.fieldKey = this.generateFieldKey(this.draggedComponent.type);
        
        // 保存插入位置信息, 并添加区块信息
        this.insertPosition = {
          ...cursor,
          blockKey: this.blockKey
        };
        
        // 在UI中显示选择的区块
        this.$message({
          message: `字段将添加到 ${this.blockKey} 区块`,
          type: 'info',
          duration: 2000
        });
        
        // 返回成功
        return true;
      } catch (e) {
        console.warn('获取位置信息时无法解析JSON，将使用默认位置', e);
        // 如果JSON解析失败，尝试创建默认配置
        this.createDefaultConfig();
        return false;
      }
    },
    
    // 创建默认配置
    createDefaultConfig() {
      try {
        // 检查是否有有效的JSON
        if (!this.formConfigStr || this.formConfigStr.trim() === '') {
          // 创建基本的配置结构
          const defaultConfig = {
            config: {
              title: "表单",
              BLOCK01: {
                title: "默认区块",
                properties: {},
                canBeFolded: true,
                hrBlockType: "normal"
              }
            }
          }
          
          // 更新编辑器内容
          this.formConfigStr = JSON.stringify(defaultConfig, null, 2)
          
          // 提示用户
          this.$message({
            message: '已创建默认配置结构',
            type: 'info',
            duration: 2000
          })
          
          // 设置默认块和字段键
          this.blockKey = 'BLOCK01'
          this.fieldKey = this.generateFieldKey(this.draggedComponent.type)
          
          // 返回，让用户重新尝试
          return false
        } else {
          // 如果有内容但解析失败，使用默认区块和生成的字段键
          this.blockKey = 'BLOCK01'
          this.fieldKey = this.generateFieldKey(this.draggedComponent.type)
        }
      } catch (e) {
        console.error('创建默认配置时出错:', e)
        this.$message.error('无法创建默认配置，请手动添加基础结构')
      }
      
      return false
    },
    
    findBlockAndGenerateKey(config, cursor, lineText) {
      // 查找光标所在的块
      let blockFound = false
      let blockKey = ''
      
      // 如果配置对象不包含config属性，则退出
      if (!config.config) {
        throw new Error('无效的表单配置')
      }
      
      // 遍历查找当前块
      Object.keys(config.config).forEach(key => {
        if (key === 'title') return // 跳过标题字段
        
        // 检查正在编辑的文本是否包含该块的标识
        if (lineText.includes(`"${key}"`)) {
          blockKey = key
          blockFound = true
        }
      })
      
      if (!blockFound) {
        // 如果未找到块，使用第一个有效的块
        const blocks = Object.keys(config.config).filter(key => key !== 'title')
        if (blocks.length > 0) {
          blockKey = blocks[0]
        } else {
          throw new Error('配置中找不到有效的区块')
        }
      }
      
      // 生成唯一的字段标识符
      const fieldKey = this.generateFieldKey(this.draggedComponent.type)
      
      return { blockKey, fieldKey }
    },
    
    generateFieldKey(componentType) {
      // 根据组件类型生成字段的标识符
      const prefix = {
        'inputText': 'text',
        'inputNumber': 'num',
        'selectSimple': 'select',
        'selectRemote': 'remoteSelect',
        'datePicker': 'date',
        'upload': 'file'
      }[componentType] || 'field'
      
      // 添加时间戳以确保唯一性
      return `${prefix}_${Date.now().toString().slice(-6)}`
    },
    
    // 处理抽屉关闭
    handleDrawerClose() {
      console.log('关闭抽屉组件');
      this.configDrawerVisible = false;
      this.draggedComponent = null;
      this.currentDragBlockContext = null;
      this.insertPosition = null;
    },
    
    // 处理抽屉提交
    handleDrawerSubmit(data) {
      console.log('收到配置数据:', data);
      
      // 检查是否获取到有效数据
      if (!data) {
        console.error('未收到有效的表单配置数据');
        this.$message.error('配置数据无效');
        return;
      }
      
      // 处理提交的配置数据逻辑保持不变...
      try {
        // 先验证当前JSON格式
        const jsonResult = this.validateAndSanitizeJSON(this.formConfigStr);
        let config = jsonResult.valid ? (jsonResult.data || JSON.parse(this.formConfigStr)) : null;
        
        // 如果JSON无效，给出提示和修复选项
        if (!jsonResult.valid) {
          this.$confirm('当前JSON格式无效，需要先修复才能添加新配置。是否自动修复？', '确认', {
            confirmButtonText: '自动修复',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            // 执行自动修复
            this.autoFixJSON();
            // 延迟后尝试再次插入
            setTimeout(() => {
              this.insertConfigData(data);
            }, 500);
          }).catch(() => {
            this.$message.info('已取消添加配置');
          });
          return;
        }
        
        // 更新配置（即使修复过也要重新解析以获取最新状态）
        if (jsonResult.fixed) {
          this.formConfigStr = JSON.stringify(jsonResult.data, null, 2);
          config = jsonResult.data;
          this.$message.warning('JSON格式已自动修复，并将添加新配置');
        }
        
        // 插入新配置
        this.insertConfigData(data, config);
        
        // 关闭抽屉
        this.configDrawerVisible = false;
      } catch (e) {
        console.error('处理配置数据失败:', e);
        this.$message.error('配置更新失败: ' + e.message);
      }
    },
    
    // 插入配置数据到JSON
    insertConfigData(data, config = null) {
      try {
        // 如果没有传入配置，则尝试解析当前配置
        if (!config) {
          config = JSON.parse(this.formConfigStr)
        }
        
        // 处理区块或字段配置插入
        if (data.code) {
          if (this.currentConfigType === 'block') {
            // 插入新区块
            if (config.config[data.code]) {
              this.$message.warning(`区块 ${data.code} 已存在，将覆盖现有配置`)
            }
            
            // 设置区块配置
            config.config[data.code] = {
              title: data.config.title,
              properties: data.config.properties || {},
              canBeFolded: data.blockConfig.canBeFolded,
              hrBlockType: data.blockConfig.hrBlockType
            }
            
            // 更新配置并提示成功
            this.formConfigStr = JSON.stringify(config, null, 2)
            this.lastValidConfig = config
            this.$message.success(`区块 ${data.code} 已添加到配置`)
            
            // 高亮新添加的区块
            this.highlightAddedCode(data.code)
          } else {
            // 插入新字段
            // 确保区块和properties存在
            if (!config.config[this.blockKey]) {
              config.config[this.blockKey] = {
                title: "",
                properties: {}
              }
            }
            
            if (!config.config[this.blockKey].properties) {
              config.config[this.blockKey].properties = {}
            }
            
            // 检查字段是否已存在
            if (config.config[this.blockKey].properties[data.code]) {
              this.$message.warning(`字段 ${data.code} 已存在，将覆盖现有配置`)
            }
            
            // 添加新字段到配置
            if (data.fieldConfig.widget === 'AreaWidget') {
              // 针对省市区组件需要生成两个字段
              const nameField = data.code;
              const codeField = data.fieldConfig.bindCode || `${nameField}Code`;
              const currentBlockKey = data.fieldConfig.bindBlock || this.blockKey;
              
              // 设置 name 字段（显示字段）
              config.config[this.blockKey].properties[nameField] = {
                title: data.fieldConfig.title || "省市区",
                type: "string",
                emptyValue: data.fieldConfig.emptyValue || "",
                required: data.fieldConfig.required || false,
                requiredMessage: data.fieldConfig.requiredMessage || `请选择${data.fieldConfig.title || "省市区"}`,
                bindBlock: currentBlockKey,
                bindCode: codeField,
                disabled: data.fieldConfig.disabled || false,
                hidden: data.fieldConfig.hidden || false,
                placeholder: data.fieldConfig.placeholder || "请选择",
                widget: "AreaWidget"
              };
              
              // 设置 code 字段（隐藏的代码值字段）
              config.config[this.blockKey].properties[codeField] = {
                type: "string",
                title: `${data.fieldConfig.title || "省市区"}Code`,
                emptyValue: "",
                required: false,
                bindBlock: currentBlockKey,
                bindCode: nameField,
                disabled: data.fieldConfig.disabled || false,
                hidden: true
              };
              
              this.$message.success(`省市区字段 ${nameField} 和代码字段 ${codeField} 已添加到配置`);
            } else {
              // 常规字段，直接添加配置
              // 过滤掉任何 ui: 前缀的属性
              const cleanConfig = { ...data.fieldConfig };
              Object.keys(cleanConfig).forEach(key => {
                if (key.startsWith('ui:')) {
                  delete cleanConfig[key];
                }
              });
              
              // 如果有 ui:options，需要将内部属性提取出来并删除 ui:options
              if (cleanConfig["ui:options"]) {
                // 提取 ui:options 中的非 ui: 前缀属性
                Object.keys(cleanConfig["ui:options"]).forEach(key => {
                  if (!key.startsWith('ui:') && !key.startsWith('err:')) {
                    cleanConfig[key] = cleanConfig["ui:options"][key];
                  }
                });
                delete cleanConfig["ui:options"];
              }
              
              config.config[this.blockKey].properties[data.code] = cleanConfig;
              
              this.$message.success(`字段 ${data.code} 已添加到配置`);
            }
            
            // 更新配置
            this.formConfigStr = JSON.stringify(config, null, 2);
            this.lastValidConfig = config;
            
            // 高亮新添加的字段
            this.highlightAddedCode(data.code);
            
            // 立即转换并应用 Schema
            this.validateAndApply();
          }
        } else {
          throw new Error('配置数据缺少必要的code属性')
        }
      } catch (e) {
        console.error('插入配置数据失败:', e)
        this.$message.error('配置更新失败: ' + e.message)
      }
    },
    
    // 高亮新添加的代码
    highlightAddedCode(code) {
      this.$nextTick(() => {
        if (this.$refs.cmEditor && this.$refs.cmEditor.codemirror) {
          const cm = this.$refs.cmEditor.codemirror
          
          try {
            // 获取当前编辑器内容
            const content = cm.getValue()
            const searchText = `"${code}"`
            
            // 查找代码位置
            const index = content.indexOf(searchText)
            if (index !== -1) {
              // 计算行号
              const beforeText = content.substring(0, index)
              const line = beforeText.split('\n').length - 1
              
              // 滚动到该位置并高亮
              cm.scrollIntoView({line, ch: 0}, 100)
              
              // 高亮展示该行
              const highlightLine = cm.addLineClass(line, 'background', 'highlight-line')
              
              // 2秒后移除高亮
              setTimeout(() => {
                cm.removeLineClass(line, 'background', 'highlight-line')
              }, 2000)
            }
          } catch (e) {
            console.error('高亮代码失败:', e)
          }
        }
      })
    },
    
    // 拖拽开始事件处理
    onDragStart(event, component) {
      console.log('拖拽开始，组件:', component);
      this.draggedComponent = component
      
      // 分析当前上下文，获取组件所在的区块信息
      if (this.$refs.cmEditor && this.$refs.cmEditor.codemirror) {
        const cm = this.$refs.cmEditor.codemirror;
        const cursor = cm.getCursor();
        const contextInfo = this.getPositionContext(cursor, cm);
        console.log('拖拽开始时的上下文:', contextInfo);
        
        // 保存当前区块信息，便于后续参考
        if (contextInfo.inBlock && contextInfo.nearestBlock) {
          this.currentDragBlockContext = contextInfo.nearestBlock;
        }
      }
      
      // 设置拖拽效果
      event.dataTransfer.effectAllowed = 'copy'
      
      // 使用自定义数据类型，避免文本拖拽
      try {
        // 使用自定义MIME类型存储组件类型
        event.dataTransfer.setData('application/vantelement-component', component.type)
        
        // 存储完整的组件数据，方便后续恢复
        event.dataTransfer.setData('application/vantelement-component-full', JSON.stringify(component))
        
        // 这部分设置一个时间戳作为文本，在拖放操作结束时会忽略这个值
        event.dataTransfer.setData('text/plain', ''+Date.now())
      } catch (e) {
        console.error('设置拖拽数据失败:', e)
      }
      
      // 设置拖拽图像（可选）
      try {
        if (event.dataTransfer.setDragImage) {
          const ghost = document.createElement('div')
          ghost.textContent = component.title
          ghost.style.padding = '5px 10px'
          ghost.style.background = '#409EFF'
          ghost.style.color = 'white'
          ghost.style.borderRadius = '4px'
          ghost.style.position = 'absolute'
          ghost.style.left = '-9999px'
          ghost.style.top = '-9999px'
          document.body.appendChild(ghost)
          
          event.dataTransfer.setDragImage(ghost, 0, 0)
          
          setTimeout(() => {
            document.body.removeChild(ghost)
          }, 100)
        }
      } catch (e) {
        console.error('设置拖拽图像失败:', e)
      }
    },
    
    autoFixJSON() {
      // 保持原有的autoFixJSON方法不变
    },
    
    // 阻止CodeMirror的事件
    preventCodeMirrorEvent(event) {
      // 仅在拖拽模式下阻止事件
      if (!this.isEditMode) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        console.log('阻止了CodeMirror的事件:', event.type);
        return false;
      }
    },
    
    // 阻止CodeMirror的原生事件 (更强力的阻止)
    preventCodeMirrorNativeEvent(event) {
      // 仅在编辑模式下阻止事件，无论是什么类型的拖拽
      if (this.isEditMode) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        console.log('阻止了CodeMirror的原生事件:', event.type);
        return false;
      }
    },
    
    // 添加辅助方法用于猜测拖拽的组件类型
    guessDraggedComponent(event) {
      // 从拖拽事件中尝试识别组件类型
      // 例如，可以检查拖拽源元素的class或其他属性
      
      // 默认尝试使用第一个可用的组件
      return this.fieldComponents[0];
    }
  }
}
</script>

<style scoped>
.config-editor {
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

.component-panel {
  margin-bottom: 5px;
  padding: 8px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.component-panel h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 16px;
  text-align: left;
}

.field-components {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.field-component-tag {
  padding: 6px 12px;
  border-radius: 4px;
  background-color: #409EFF;
  color: white;
  cursor: move;
  user-select: none;
  transition: all 0.3s;
}

.field-component-tag:hover {
  background-color: #66b1ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
}

.block-tag {
  background-color: #67C23A;
}

.block-tag:hover {
  background-color: #85ce61;
}

.box-card {
  width: 100%;
  flex: 1;
  overflow: hidden;
  text-align: left;
  display: flex;
  flex-direction: column;
}

.vue-codemirror {
  height: 100%;
  position: relative;
  z-index: 1;
}

.actions {
  margin-top: 8px;
  text-align: right;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}

/* 确保CodeMirror填充整个卡片 */
::v-deep .CodeMirror {
  height: 100% !important;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
}

/* 高亮行样式 */
::v-deep .highlight-line {
  background-color: rgba(64, 158, 255, 0.1);
  border-left: 3px solid #409EFF;
  transition: all 0.3s ease;
}

.codemirror-container {
  height: 100%;
  width: 100%;
}

.drop-zone-container {
  position: relative;
  flex: 1;
  width: 100%;
  height: 500px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.drop-zone-container:after {
  content: attr(data-mode);
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 3px;
  opacity: 0.8;
  pointer-events: none;
}

.drop-zone-container[data-mode="拖拽模式"] {
  background-color: rgba(103, 194, 58, 0.03);
}

.drop-zone-container[data-mode="拖拽模式"]:after {
  content: "拖拽模式";
  background-color: rgba(103, 194, 58, 0.6);
  color: white;
}

.drop-zone-container[data-mode="编辑模式"] {
  background-color: rgba(64, 158, 255, 0.03);
}

.drop-zone-container[data-mode="编辑模式"]:after {
  content: "编辑模式";
  background-color: rgba(64, 158, 255, 0.6);
  color: white;
}

/* 拖拽悬停样式 */
.drop-zone-container.drag-over {
  border: 2px dashed #409EFF;
  background-color: rgba(64, 158, 255, 0.1);
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
}

.drop-zone-container.drag-over::after {
  content: "放置此处添加组件";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(64, 158, 255, 0.9);
  color: white;
  padding: 10px 15px;
  border-radius: 4px;
  font-weight: bold;
  z-index: 100;
  pointer-events: none;
}

.highlight-line {
  background-color: rgba(255, 230, 0, 0.2);
  animation: pulse 1.5s ease-in-out;
}

@keyframes pulse {
  0% { background-color: rgba(255, 230, 0, 0.2); }
  50% { background-color: rgba(255, 230, 0, 0.5); }
  100% { background-color: rgba(255, 230, 0, 0.2); }
}

/* 增加全局抽屉样式 */
.pc-drawer {
  position: fixed;
  z-index: 9999 !important;
}
</style>

<style>
/* 全局样式 */
body .pc-drawer__wrapper {
  z-index: 3000 !important;
}

body .pc-drawer__container {
  position: fixed;
  z-index: 3000 !important;
}

body .v-modal {
  z-index: 2999 !important;
}

/* 确保抽屉组件始终在最上层 */
.pc-drawer {
  position: fixed !important;
  z-index: 9999 !important;
}

.pc-drawer__wrapper {
  z-index: 9999 !important;
}

.pc-drawer__container {
  z-index: 9999 !important;
}

.v-modal {
  z-index: 9998 !important; 
}
</style>
