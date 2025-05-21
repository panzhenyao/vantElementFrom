<template>
  <div class="preview-list">
    <!-- 文件项列表 -->
    <div v-for="file in fileList" :key="file.uid" class="preview-item">
      <div class="preview-image" @click="handlePreview(file)">
        <img :src="file.url" :alt="file.name">
      </div>
      <!-- 操作按钮 -->
      <div class="preview-actions">
        <i class="pc-icon-zoom-in" @click="handlePreview(file)"></i>
        <i class="pc-icon-delete" @click="handleRemove(file)"></i>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <pc-dialog
      :visible.sync="previewVisible"
      append-to-body
      :modal="true"
      custom-class="preview-dialog"
    >
      <img v-if="previewUrl" :src="previewUrl" class="preview-dialog-image" />
    </pc-dialog>
  </div>
</template>

<script>
export default {
  name: 'PreviewList',
  props: {
    fileList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      previewVisible: false,
      previewUrl: '',
    }
  },
  methods: {
    // 处理文件预览
    handlePreview(file) {
      this.previewUrl = file.url
      this.previewVisible = true
      this.$emit('preview', file)
    },
    // 处理文件删除
    handleRemove(file) {
      this.$emit('remove', file)
    },
  },
}
</script>

<style scoped>
.preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s;
}

.preview-item:hover .preview-actions {
  opacity: 1;
}

.preview-actions i {
  color: #fff;
  font-size: 20px;
  cursor: pointer;
}

.preview-actions i:hover {
  color: #409EFF;
}

.preview-dialog {
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-dialog-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

:deep(.pc-dialog__body) {
  padding: 0;
  display: flex;
  justify-content: center;
}
</style>