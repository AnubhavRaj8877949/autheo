# Stage 1 — deps
FROM node:22.17-alpine AS deps

WORKDIR /app

RUN apk update && apk upgrade --no-cache

RUN apk upgrade --no-cache libcrypto3 libssl3 musl \
 && addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs \
 && chown nextjs:nodejs /app

USER nextjs

COPY --chown=nextjs:nodejs --chmod=440 package*.json ./

# --legacy-peer-deps resolves peer-dep conflicts without the nuclear --force
RUN npm ci --legacy-peer-deps


# Stage 2 — builder
FROM node:22.17-alpine AS builder

WORKDIR /app

RUN apk update && apk upgrade --no-cache

RUN apk upgrade --no-cache libcrypto3 libssl3 musl \
 && addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs \
 && chown nextjs:nodejs /app

USER nextjs

COPY --chown=nextjs:nodejs --from=deps /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .



RUN npm run build


# Stage 3 — runner (nginx serves the CRA static build)
FROM nginx:stable-alpine AS runner

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]
