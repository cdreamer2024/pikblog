module.exports = {
  devServer: {
    port: 5001, // Vue 开发服务器端口
    host: "localhost",
    open: true, // 自动打开浏览器
    proxy: {
      "/api": {
        target: "http://10.140.2.11/evcr",
        changeOrigin: true,
        logLevel: "debug",
        secure: false,
      },
    },
  },
};
