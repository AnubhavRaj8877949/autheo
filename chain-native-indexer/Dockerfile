# Stage 1: Install dependencies
FROM node:22.17-alpine  AS deps

WORKDIR /app
RUN apk update && apk upgrade --no-cache
RUN chown -R node:node /app

USER node

COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma/

RUN npm ci
RUN ./node_modules/.bin/prisma generate

# ─── Stage 2: build ───────────────────────────────────────────────────────────
# Stage 2: Compile TypeScript
FROM node:22.17-alpine AS builder

WORKDIR /app
RUN apk update && apk upgrade --no-cache
RUN chown -R node:node /app
RUN apk add --no-cache openssl


USER node

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=deps --chown=node:node /app/prisma ./prisma
COPY --chown=node:node . .
RUN chmod -R a-w ./node_modules ./prisma



RUN npm run build:prod

# ─── Stage 3: runner ──────────────────────────────────────────────────────────
FROM node:22.17-alpine AS runner

WORKDIR /app
RUN apk update && apk upgrade --no-cache

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeuser

COPY --from=builder --chown=nodeuser:nodejs /app/build ./build
COPY --from=deps --chown=nodeuser:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nodeuser:nodejs /app/prisma ./prisma
COPY --chown=nodeuser:nodejs package.json ./
RUN chmod -R a-w ./build ./node_modules ./prisma ./package.json

RUN mkdir -p ./logs && chown nodeuser:nodejs ./logs
RUN apk add --no-cache openssl

USER nodeuser

EXPOSE 3146

CMD ["node", "build/server.js"]
