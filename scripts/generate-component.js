#!/usr/bin/env node
/**
 * Scaffold a component (controller + service) and register its routes.
 *
 *   npm run generate -- <name> [--actions list,get,create,update,remove] [--secured=false] [--base=/api/v1]
 *
 *   npm run generate -- order-item
 *   -> app/components/order-item/controllers/order-item-controller.js
 *   -> app/components/order-item/services/order-item-service.js
 *   -> 5 routes appended to app/configs/route.config.json under /api/v1/order-items
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith('--'));
const opt = (key, def) => (args.find((a) => a.startsWith(`--${key}=`)) || `--${key}=${def}`).split('=')[1];

if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error('Usage: npm run generate -- <kebab-case-name> [--actions=list,get,create,update,remove] [--secured=false] [--base=/api/v1]');
  process.exit(1);
}

const ACTIONS = {
  list: { method: 'GET', suffix: '' },
  get: { method: 'GET', suffix: '/:id' },
  create: { method: 'POST', suffix: '' },
  update: { method: 'PUT', suffix: '/:id' },
  remove: { method: 'DELETE', suffix: '/:id' },
};
const actions = opt('actions', 'list,get,create,update,remove').split(',').map((a) => a.trim());
const bad = actions.filter((a) => !ACTIONS[a]);
if (bad.length) { console.error(`Unknown action(s): ${bad.join(', ')}. Valid: ${Object.keys(ACTIONS).join(', ')}`); process.exit(1); }

const pascal = name.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join('');
const upper = name.toUpperCase().replace(/-/g, '_');
const dir = path.join(ROOT, 'app/components', name);
const ctrlFile = path.join(dir, 'controllers', `${name}-controller.js`);
const svcFile = path.join(dir, 'services', `${name}-service.js`);
if (fs.existsSync(ctrlFile) || fs.existsSync(svcFile)) { console.error(`Component "${name}" already exists`); process.exit(1); }

const controller = `const ${pascal}Service = require('../services/${name}-service');

class ${pascal}Controller {
  constructor () {
    this.service = new ${pascal}Service();
  }
${actions.map((a) => `
  async ${a} (req, res, next) {
    const { logger } = req.locals;
    logger.info('[${upper}_CONTROLLER] :: ${a} : START');
    try {
      const result = await this.service.${a}({ logger, params: req.params, query: req.query, body: req.body, user: req.user });
      return res.status(${a === 'create' ? 201 : 200}).send(result);
    } catch (err) {
      return next(err);
    }
  }`).join('\n')}
}

module.exports = new ${pascal}Controller();
`;

const service = `class ${pascal}Service {
${actions.map((a) => `  async ${a} ({ logger }) {
    logger.debug('[${upper}_SERVICE] :: ${a}');
    // TODO: implement
    return {};
  }`).join('\n\n')}
}

module.exports = ${pascal}Service;
`;

fs.mkdirSync(path.dirname(ctrlFile), { recursive: true });
fs.mkdirSync(path.dirname(svcFile), { recursive: true });
fs.writeFileSync(ctrlFile, controller);
fs.writeFileSync(svcFile, service);

const cfgFile = path.join(ROOT, 'app/configs/route.config.json');
const cfg = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
const base = `${opt('base', '/api/v1')}/${name}s`;
const secured = opt('secured', 'true') !== 'false';
actions.forEach((a) => {
  const route = base + ACTIONS[a].suffix;
  if (cfg.routes.some((r) => r.route === route && r.method === ACTIONS[a].method)) return;
  const item = { route, method: ACTIONS[a].method, action: a, controller: `../components/${name}/controllers/${name}-controller.js` };
  if (!secured) item.secured = false;
  cfg.routes.push(item);
});
fs.writeFileSync(cfgFile, `${JSON.stringify(cfg, null, 2)}\n`);

console.log(`Created ${path.relative(ROOT, ctrlFile)}\nCreated ${path.relative(ROOT, svcFile)}\nRegistered ${actions.length} route(s) under ${base}`);
