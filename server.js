require('dotenv').config({ override: process.env.NODE_ENV === 'local' });

const http = require('http');
const util = require('util');
const cors = require('cors');
const morgan = require('morgan');
const Multer = require('multer');
const helmet = require('helmet');
const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const swaggerJsDocs = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { get, set, has } = require('lodash');
const { StatusCodes } = require('http-status-codes');
const { InternalServerError, NotFound } = require('throw.js');

const settings = require('./app/configs/settings/settings-config');
const swagger = require('./app/configs/swagger');
const routeConfig = require('./app/configs/route-config');
const errorMessages = require('./app/configs/error.config.json');
const { initLogger } = require('./app/utils/logger');
const { generateShortUUID } = require('./app/utils/uuid');
const { COOKIE_NAME, ERROR_MESSAGE, SENSITIVE_FIELDS } = require('./app/constant/constants');

const Logger = initLogger(get(settings, 'LOGGER_LEVEL', null));
const specs = swaggerJsDocs(swagger);

function configureApplication (app) {
  app.use(morgan(settings.NODE_ENV === 'local' ? 'dev' : 'combined'));

  // File upload (field name "file"), kept in memory, 50MB max
  app.use(Multer({ storage: Multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }).single('file'));

  // CORS whitelist from CORS_WHITELIST env (comma separated, '*' wildcard)
  const patterns = settings.CORS_WHITELIST.split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => new RegExp(`^${s.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`));
  app.use(
    cors({
      origin (origin, callback) {
        // no Origin header => same-origin / server-to-server
        if (!origin || patterns.some((re) => re.test(origin))) return callback(null, true);
        return callback(new Error(`Bad Request, Origin not allowed : ${origin}`));
      },
      credentials: true,
      exposedHeaders: ['X-Total-Count'],
    })
  );

  app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.type('application/json');
    next();
  });

  // session id + per-request logger (req.locals.logger)
  app.use((req, res, next) => {
    req.sessionId = req.cookies[COOKIE_NAME.SESSION_ID] || generateShortUUID();
    if (!req.cookies[COOKIE_NAME.SESSION_ID]) res.cookie(COOKIE_NAME.SESSION_ID, req.sessionId);
    req.id = generateShortUUID();
    set(req, 'locals.logger', Logger.child({ requestId: req.id, sessionId: req.sessionId }));
    next();
  });
}

function configureErrorHandler (app) {
  app.use((req, res, next) => next(new NotFound(errorMessages.ERR_API_NOT_FOUND)));

  // eslint-disable-next-line no-unused-vars
  app.use((_err, req, res, _next) => {
    let err = _err;
    const log = Logger.child({ requestId: req.id });

    if (err?.name === 'SequelizeConnectionRefusedError') err = new InternalServerError(ERROR_MESSAGE.CONTACT_ADMIN);

    SENSITIVE_FIELDS.forEach((f) => has(req, `body.${f}`) && set(req, `body.${f}`, '*******'));

    log.error(`${req.method} ${req.url}`);
    log.error(`body: ${util.inspect(req.body, { depth: 2, breakLength: Infinity })}`);
    log.error(`${err} :: ${err.stack}`);

    const json = { message: err.message, errorCode: err.errorCode };
    if (settings.NODE_ENV === 'local') json.stack = err.stack; // never expose stack outside local
    res.status(err.statusCode || err.status || StatusCodes.INTERNAL_SERVER_ERROR).json(json);
  });
}

function start () {
  const app = express();
  configureApplication(app);
  routeConfig.registerRoutes(app, settings);
  configureErrorHandler(app);
  http.createServer(app).listen(settings.thisNode.PORT, () => {
    Logger.info('listening at http://%s:%s', settings.thisNode.HOST_NAME, settings.thisNode.PORT);
  });
}

start();
