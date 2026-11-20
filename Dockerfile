FROM node:20 AS deps
WORKDIR /srv/app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

FROM node:20-slim
WORKDIR /srv/app
COPY --from=deps --chown=node:node /srv/app/node_modules ./node_modules
COPY --chown=node:node . .
USER node
CMD ["node", "server.js"]
