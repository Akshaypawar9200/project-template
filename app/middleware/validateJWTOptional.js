const { StatusCodes } = require('http-status-codes');
const { getToken, verifyToken } = require('./authToken');

// Sets req.user when a valid token is present; anonymous requests pass through.
module.exports = function validateJWTOptional (req, res, next) {
  const token = getToken(req);
  if (!token) return next();
  try {
    const decoded = verifyToken(token);
    req.user = { ...decoded, id: String(decoded.sub || '').split('|').pop() };
    return next();
  } catch (err) {
    req.locals.logger.error(`[validateJWTOptional_MIDDLEWARE] : invalid token ${err.message}`);
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized - Invalid token' });
  }
};
