const { StatusCodes } = require('http-status-codes');
const { getToken, verifyToken } = require('./authToken');

module.exports = function validateJWT (req, res, next) {
  const { logger } = req.locals;
  const token = getToken(req);
  if (!token) {
    logger.error('[validateJWT_MIDDLEWARE] : token not found');
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication Failure' });
  }
  try {
    const decoded = verifyToken(token);
    req.user = { ...decoded, id: String(decoded.sub || '').split('|').pop() };
    return next();
  } catch (err) {
    logger.error(`[validateJWT_MIDDLEWARE] : invalid token ${err.message}`);
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized - Invalid token' });
  }
};
