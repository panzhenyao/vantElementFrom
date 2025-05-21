# Vue Element UI 和 Vant UI 示例项目

这是一个使用 Vue.js 2.x，并集成了 Element UI 和 Vant 组件库的示例项目。

## 项目设置

### 安装依赖
```
npm install
```

### 开发环境编译和热重载
```
npm run serve
```

### 生产环境编译和压缩
```
npm run build
```

### 代码检查
```
npm run lint
```

## 技术栈

- Vue.js 2.6.14
- Element UI 2.15.0
- Vant 2.12.0

## 按需引入

本项目已配置 Element UI 和 Vant 的按需引入功能，减小打包体积。
- Element UI 通过 babel-plugin-component 实现
- Vant 通过 babel-plugin-import 实现 