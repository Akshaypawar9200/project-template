const deepFreeze = require('../../utils/deepFreeze');
const mainConfig = require('./main.config');

mainConfig.validate({ allowed: 'strict' });
const main = mainConfig.get();

// Loads settings.config.<NODE_ENV>.js and merges it over main config
const envConfig = require(`./settings.config.${main.NODE_ENV}.js`);
envConfig.validate({ allowed: 'strict' });

module.exports = deepFreeze({ ...main, ...envConfig.get() });
