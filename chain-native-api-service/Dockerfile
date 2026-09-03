# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /usr/src/app
# Upgrade bundled npm so its vendored tar is >= 7.5.19 (fixes CVE-2026-59873)
RUN apk add --no-cache alpine-sdk python3 openssl \
    && npm install -g npm@11.18.0 \
    && npm cache clean --force \
    && chown node:node /usr/src/app
COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma
USER node
RUN npm install --ignore-scripts

# Stage 2: Build
FROM deps AS builder
COPY --chown=node:node . .
RUN npm run generate:prisma && npm run build:prod

# Stage 3: Runner
FROM node:22-alpine AS production
WORKDIR /usr/src/app
# Upgrade bundled npm so its vendored tar is >= 7.5.19 (fixes CVE-2026-59873)
RUN apk add --no-cache openssl \
    && npm install -g npm@11.18.0 \
    && npm cache clean --force \
    && chown node:node /usr/src/app
COPY --chown=node:node package*.json ./
USER node
RUN npm install --omit=dev --ignore-scripts
COPY --from=builder --chown=node:node /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=node:node /usr/src/app/build ./build
ENV NODE_ENV=production
EXPOSE 4003
CMD ["node", "build/src/server.js"]
