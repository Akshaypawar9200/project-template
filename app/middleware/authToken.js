const jsonwebtoken = require('jsonwebtoken');
const settings = require('../configs/settings/settings-config');
const { COOKIE_NAME } = require('../constant/constants');

// Token from "Authorization: Bearer <jwt>" or the idToken cookie.
// Swap this file out if you use a different auth provider (Auth0, Firebase, ...).
const getToken = (req) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return req.cookies?.[COOKIE_NAME.ID_TOKEN] || null;
};

const verifyToken = (token) => jsonwebtoken.verify(token, settings.JWT_SECRET, { algorithms: ['HS256'] });

module.exports = { getToken, verifyToken };
