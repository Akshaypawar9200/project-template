module.exports = {
  definition: {
    openapi: '3.0.1',
    info: { title: '__PROJECT_NAME__', version: '0.0.0', description: 'API description' },
    components: {
      securitySchemes: { cookieAuth: { type: 'apiKey', in: 'cookie', name: 'idToken' } },
    },
  },
  // Add @swagger JSDoc blocks above controller methods
  apis: ['./app/components/**/controllers/*.js'],
};
