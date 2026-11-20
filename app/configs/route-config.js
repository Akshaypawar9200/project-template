const get = require('lodash/get');
const trim = require('lodash/trim');
const middleware = require('../middleware');
const validateJWT = require('../middleware/validateJWT');
const checkPermission = require('../middleware/checkPermission');

const METHODS = ['get', 'put', 'post', 'delete', 'patch'];

/**
 * Reads route.config.json and registers every route on the express app.
 *
 * Route item fields:
 *   route               (required) express path, e.g. /api/v1/items/:id
 *   method              (required) GET | POST | PUT | PATCH | DELETE
 *   controller          (required) path to controller, relative to this file
 *   action              controller method name; defaults to the lower-cased method
 *   secured             default true -> validateJWT
 *   permissions         [..] any-of permission check (needs secured)
 *   middlewareNameList  [..] names exported from app/middleware/index.js
 */
class RouteConfig {
  loadRouteConfig () {
    const config = require('./route.config.json');
    if (!config.routes || config.routes.length === 0) throw new Error('"routes" not defined in route.config.json');
    return config;
  }

  loadController (item) {
    if (!item.controller) throw new Error(`Undefined "controller" for route ${item.route}`);
    try {
      return require(item.controller);
    } catch (e) {
      throw new Error(`Unable to load ${item.controller}: ${e}`);
    }
  }

  getMethod (item) {
    const method = (item.method || '').toLowerCase();
    if (!METHODS.includes(method)) throw new Error(`Invalid "method" for route ${item.route}: ${item.method}`);
    return method;
  }

  buildHandlers (item, controller) {
    const action = get(item, 'action') || this.getMethod(item);
    if (typeof controller[action] !== 'function') {
      throw new Error(`Controller ${item.controller} has no method "${action}" (route ${item.route})`);
    }

    const handlers = [];
    if (item.secured ?? true) handlers.push(validateJWT);
    if (item.permissions?.length) handlers.push(checkPermission(item.permissions));

    const names = get(item, 'middlewareNameList', []);
    if (!Array.isArray(names)) throw new Error(`middlewareNameList must be an array (route ${item.route})`);
    names.forEach(raw => {
      const name = trim(raw);
      if (typeof middleware[name] !== 'function')
        throw new Error(`"${name}" is not a middleware (route ${item.route})`);
      handlers.push(middleware[name]);
    });

    handlers.push((req, res, next) => controller[action](req, res, next));
    return handlers;
  }

  registerRoutes (application, settings) {
    for (const item of this.loadRouteConfig().routes) {
      if (!item.route) throw new Error('Undefined "route" in route.config.json');
      application[this.getMethod(item)](item.route, ...this.buildHandlers(item, this.loadController(item)));
    }
    if (settings.NODE_ENV === 'local') {
      application.get('/config', (req, res) => res.status(200).json(settings));
    }
  }
}

module.exports = new RouteConfig();
