/**
 * Vue CLI 项目配置文件
 */
const path = require('path')

module.exports = {
  // 禁用 eslint 检查
  lintOnSave: false,
  // 设置打包后的资源路径为相对路径
  publicPath: './',
  // webpack 配置
  configureWebpack: {
    // 解析配置
    resolve: {
      // 路径别名配置
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      // 自动解析的扩展名
      extensions: ['.js', '.vue', '.json']
    },
    // 模块规则配置
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-syntax-dynamic-import']
            }
          }
        }
      ]
    }
  },
  // webpack 链式配置
  chainWebpack: config => {
    // 配置 babel-loader
    config.module
      .rule('js')
      .use('babel-loader')
      .tap(options => {
        return {
          ...options,
          plugins: [
            ...((options && options.plugins) || []),
            '@babel/plugin-syntax-dynamic-import'
          ]
        }
      })
  }
}