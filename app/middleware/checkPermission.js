const { StatusCodes } = require('http-status-codes');

module.exports = (requiredPermissions = []) => {
  return (req, res, next) => {
    const userPermissions = req.user?.user_permissions || [];

    const permissionSet = new Set(userPermissions);

    const hasPermission = requiredPermissions.some((perm) => permissionSet.has(perm));

    if (!hasPermission) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  };
};
