const convict = require('convict');

// Shared schema for every environment. Add new env vars here.
module.exports = (defaults = {}) =>
  convict({
    LOGGER_LEVEL: {
      doc: 'Logger level',
      format: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
      default: defaults.LOGGER_LEVEL || 'info',
      env: 'LOGGER_LEVEL',
    },
    CORS_WHITELIST: {
      doc: 'Comma separated allowed origins, * is a wildcard',
      format: String,
      default: '',
      env: 'CORS_WHITELIST',
    },
    JWT_SECRET: {
      doc: 'HS256 secret used to verify JWTs',
      format: String,
      default: null,
      nullable: false,
      sensitive: true,
      env: 'JWT_SECRET',
    },
  });
