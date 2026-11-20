const uuid = require('uuid');

const generateShortUUID = () => uuid.v4().replace(/-/g, '').substring(0, 12);

module.exports = { generateShortUUID, isUuidValid: (id) => uuid.validate(id) };
