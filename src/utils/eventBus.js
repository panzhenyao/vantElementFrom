/**
 * 事件总线模块
 * 用于组件间的事件通信
 * 基于 Vue 实例实现发布订阅模式
 */
import Vue from 'vue'

// Create a new Vue instance to use as an event bus
const EventBus = new Vue()

export default EventBus