<template>
  <div class="upload-container">
    <pc-upload
      :disabled="disabled"
      action="https://jsonplaceholder.typicode.com/posts/"
      :multiple="maxCount > 1"
      :accept="acceptTypes"
      :show-file-list="false"
      :before-upload="handleBeforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :class="{ 'is-disabled': isMaxCount }"
    >
      <!-- 上传触发器 -->
      <div v-if="!isMaxCount" class="upload-trigger">
        <i class="pc-icon-plus"></i>
        <span>点击上传</span>
      </div>
    </pc-upload>

    <!-- 文件预览列表 -->
    <div class="upload-preview" v-if="fileList.length">
      <preview-list
        :file-list="fileList"
        @remove="handleRemove"
        @preview="handlePreview"
      />
    </div>
  </div>
</template>

<script>
import PreviewList from './PreviewList.vue'

export default {
  name: 'UploadWidget',
  components: {
    PreviewList
  },
  props: {
    value: {
      type: null,
      default: () => [],
    },
    maxCount: { // 最大上传数量
      type: Number,
      default: 1,
    },
    maxSize: { // 文件大小限制(字节)
      type: Number,
      default: 20 * 1024 * 1024,
    },
    list: {
      type: Object,
      default: () => ({}),
    },
    disabled: { // 是否禁用
      type: Boolean,
      default: false,
    },
    required: { // 是否必填
      type: Boolean,
      default: false,
    },
    schema: { // JSON Schema 
      type: Object,
      default: () => ({}),
    },
    filedKey: { // 字段标识
      type: String,
    },
    fileTypes: { // 允许的文件类型
      type: String,
      default: '',
    },
  },
  data() {
    return {
      fileList: [],
    }
  },
  computed: {
    acceptTypes() {
      if (!this.fileTypes) return ''
      return this.fileTypes.split(',').map(type => `.${type}`).join(',')
    },
    isMaxCount() {
      return this.fileList.length >= this.maxCount
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        if (val && Array.isArray(val)) {
          this.fileList = val.map((item, index) => ({
            ...item,
            uid: index,
          }))
        }
      },
    },
  },
  methods: {
    handleBeforeUpload(file) {
      // Check file size
      if (file.size > this.maxSize) {
        this.$message.error(`文件大小不能超过${this.maxSize / 1024 / 1024}MB`)
        return false
      }

      // Check file type
      if (this.fileTypes) {
        const extension = file.name.split('.').pop().toLowerCase()
        const types = this.fileTypes.split(',').map(type => type.toLowerCase())
        if (!types.includes(extension)) {
          this.$message.error(`只能上传${this.fileTypes}格式的文件`)
          return false
        }
      }

      return true
    },
    handleSuccess(response, file) {
      const newFile = {
        uid: file.uid,
        name: file.name,
        url: response.url || response.data?.url,
        status: 'success',
      }
      this.fileList.push(newFile)
      this.emitChange()
    },
    handleError(err) {
      this.$message.error('上传失败：' + err.message)
    },
    handleRemove(file) {
      const index = this.fileList.findIndex(item => item.uid === file.uid)
      if (index !== -1) {
        this.fileList.splice(index, 1)
        this.emitChange()
      }
    },
    handlePreview(file) {
      this.$emit('preview', file)
    },
    emitChange() {
      this.$emit('input', this.fileList)
      this.$emit('change', this.fileList)
    },
  },
}
</script>

<style scoped>
.upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.upload-trigger {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.upload-trigger:hover {
  border-color: #409EFF;
}

.is-disabled {
  display: none;
}

.pc-icon-plus {
  font-size: 28px;
  color: #8c939d;
  margin-bottom: 8px;
}
</style>