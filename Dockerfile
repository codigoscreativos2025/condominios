FROM node:20 AS base

FROM base AS deps
RUN apt-get update && apt-get install -y libc6 libssl3 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma/seed.ts ./prisma/seed.ts
COPY --from=builder /app/node_modules ./node_modules

RUN mkdir /home/nextjs && chown nextjs:nodejs /home/nextjs
RUN mkdir /app/uploads && chown nextjs:nodejs /app/uploads
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

ENV HOME=/home/nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN npx prisma db push --accept-data-loss && npx tsx prisma/seed.ts

USER nextjs

CMD ["node", "server.js"]
