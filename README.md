# __PROJECT_NAME__

Express API starter: config-driven routes, JWT auth + permission checks, per-request logger, swagger, convict settings, Docker.

## Run
```bash
cp .env.example .env   # set JWT_SECRET
npm install
npm run dev            # http://127.0.0.1:3000/api/v1/ping, docs at /api/api-docs
```

## Add an endpoint
1. **Scaffold** (controller + service + routes in one step):
   `npm run generate -- order-item --actions=list,get,create`
2. **Or by hand**
   - Service: `app/components/<name>/services/<name>-service.js`
   - Controller: `app/components/<name>/controllers/<name>-controller.js` (export an instance; methods are `(req, res, next)`; use `req.locals.logger`)
   - Route: add an item to `app/configs/route.config.json`

```json
{
  "route": "/api/v1/items/:id",
  "method": "GET",
  "action": "get",
  "controller": "../components/item/controllers/item-controller.js",
  "secured": true,
  "permissions": ["item:view"],
  "middlewareNameList": ["myMiddleware"]
}
```
| Field | Default | Notes |
|---|---|---|
| route, method, controller | required | controller path is relative to `app/configs/` |
| action | lower-cased method | controller method name |
| secured | `true` | runs `validateJWT` |
| permissions | none | any-of match against `req.user.user_permissions` |
| middlewareNameList | `[]` | names exported from `app/middleware/index.js` |

Startup fails fast if a controller, action or middleware name is wrong.

## Add config / env var
Add it to `app/configs/settings/base.config.js` and `.env.example`; read via `require('app/configs/settings/settings-config')`.

## Notes
- Auth lives in `app/middleware/authToken.js` (HS256 JWT from Bearer header or `idToken` cookie). Replace it for Auth0/Firebase etc.; set `user_permissions` on the token or in `validateJWT`.
- Never commit `.env` or tokens. Private npm packages should use an `.npmrc` with `${NPM_TOKEN}`, not credentials in package.json.
