const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://polish-tracker-backend:3001',
      changeOrigin: true,
      logLevel: 'debug'
    })
  );
};