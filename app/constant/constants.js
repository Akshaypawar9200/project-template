module.exports = Object.freeze({
  COOKIE_NAME: {
    ID_TOKEN: 'idToken',
    USER_DETAILS: 'userDetails',
    SESSION_ID: 'sessionId',
  },
  ERROR_MESSAGE: {
    CONTACT_ADMIN: 'Something went wrong, Contact admin.',
  },
  // Masked in error logs
  SENSITIVE_FIELDS: ['password', 'confirmPassword', 'access_token', 'id_token', 'refresh_token'],
});
