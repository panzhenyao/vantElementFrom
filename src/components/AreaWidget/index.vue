<!---
  H5省市区基础组件

  组件使用配置说明：
  后端配置该组件时，需要同步配置code和name，少配置了一个就会报错
  其中：code字段是隐藏的字段，name字段作为显示字段进行使用的，若然不配置name组件的话，则会在使用过程中代码报错
  前端仅需要使用name字段的事件进行接收和传值处理；
--->
<template>
  <div class="areaWidget">
    <van-field
      v-model="showLabel"
      primary="content"
      style="padding: 0"
      right-icon="arrow"
      :disabled="disabled"
      :rules="[{ required: required, message: `请选择${title}` }]"
      :style="{ 'text-align': 'right' }"
      placeholder="请选择"
      readonly
      @click.native="disabled ? '' : showPopup()"
    >
    </van-field>
    <div>
      <van-popup
        v-model="show"
        round
        position="bottom"
        :style="{ maxHeight: '85%', overflow: 'auto', '-webkit-overflow-scrolling': 'touch' }"
        :overlay="true"
      >
        <van-picker
          ref="pickerDialog"
          :title="title"
          show-toolbar
          cancel-button-text="清空"
          value-key="areaName"
          :columns="sourceList"
          @cancel="onAreaCancel"
          @confirm="onAreaConfirm"
          v-model="defaultVal"
        >
        </van-picker>
      </van-popup>
    </div>
  </div>
</template>

<script>
import api from '@/api/index'
/**
 * 省市区基础组件
 *
 *
 */
export default {
  name: 'AreaWidget',

  props: {
    rootFormData: {
      type: Object,
      default: () => ({}),
    },
    schema: {
      type: Object,
      default: () => ({}),
    },
    value: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '标题',
    },
    required: {
      type: Boolean,
      default: false,
    },
    separator: {
      type: String,
      default: ' ',
    },
  },
  data() {
    return {
      areaTree: [],
      show: false,
      showLabel: '',
      defaultVal: [],
      sourceList: [],
      selectPosition: [],
    }
  },

  mounted() {
    this.init()
  },
  watch: {
    value: {
      handler(val) {
        this.showLabel = val || ''
      },
      immediate: true,
    },
  },
  methods: {
    onAreaCancel() {
      this.defaultVal = []
      this.selectPosition = []
      this.$refs.pickerDialog?.setIndexes([0, 0, 0])
      this.show = false
      this.$emit('input', '')
      
      const schema = this.schema
      const bindBlock = schema?.bindBlock
      const bindCode = schema?.bindCode
      
      if(bindBlock && bindCode) {
        this.rootFormData[bindBlock][bindCode] = ''
      }
    },
    onAreaConfirm(name, position) {
      this.selectPosition = position
      
      let pickerItemList = []
      let pickerAreaCode = ''
      let _areaList = JSON.parse(JSON.stringify(this.sourceList))
      
      _areaList?.forEach((province, p) => {
        if (p === position[0]) {
          pickerItemList.push(province)
          province?.children?.forEach((city, c) => {
            if (c === position[1]) {
              pickerItemList.push(city)
              city?.children?.forEach((area, a) => {
                if (a === position[2]) {
                  pickerItemList.push(area)
                }
              })
            }
          })
        }
      })
      
      const pickerAreaName = name.join(this.separator)
      
      pickerItemList?.forEach((item) => {
        pickerAreaCode += item.areaCode + ' '
      })
      
      pickerAreaCode = pickerAreaCode.trim()
      this.showLabel = pickerAreaName
      this.$emit('input', pickerAreaName)
      
      const schema = this.schema
      const bindBlock = schema?.bindBlock
      const bindCode = schema?.bindCode
      
      if(bindBlock && bindCode) {
        this.rootFormData[bindBlock][bindCode] = pickerAreaCode
      }
      
      this.show = false
    },
    async init() {
      try {
        if (!this.areaTree.length) {
          await this.getDictByAreaTree()
        } else {
          this.setDictAreaTreeList(this.areaTree)
        }
      } finally {
        this.handlerDefaultValue()
      }
    },
    setDictAreaTreeList(data) {
      const hrFilterFirstAreaCode = this.schema?.hrFilterFirstAreaCode || ''
      
      if (hrFilterFirstAreaCode) {
        data = data.filter((provinceItem) => provinceItem.areaCode === hrFilterFirstAreaCode)
      }

      this.sourceList = data
    },
    handlerDefaultValue() {
      if (typeof this.value !== 'string') return
      
      this.defaultVal = this.value.split(this.separator)
      this.showLabel = this.value
    },
    async getDictByAreaTree() {
      const { data } = await api.queryDict({ dictCode: 'areaTree' })
      this.setDictAreaTreeList(data)
    },
    showPopup() {
      this.show = true
      setTimeout(() => {
        this.$refs.pickerDialog?.setValues(this.defaultVal)
        this.$refs.pickerDialog?.setIndexes(this.selectPosition)
      }, 50)
    },
  },
}
</script>
