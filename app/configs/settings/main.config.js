const convict = require('convict');
const convictFormatWithValidator = require('convict-format-with-validator');

convict.addFormats(convictFormatWithValidator);

module.exports = convict({
  thisNode: {
    HOST_NAME: { doc: 'Host', format: 'ipaddress', default: '127.0.0.1', env: 'HOST_NAME' },
    PORT: { doc: 'Port', format: 'port', default: 3000, env: 'PORT' },
  },
  NODE_ENV: {
    doc: 'environment',
    format: ['local', 'development', 'beta', 'production'],
    default: 'local',
    env: 'NODE_ENV',
  },
});
