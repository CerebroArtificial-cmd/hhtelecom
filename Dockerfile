# Build stage
FROM node:20-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Opcional: default local; Heroku sobrescreve

COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
# Copie configs se existirem
# COPY --from=build /app/next.config.js ./next.config.js

EXPOSE 3000
CMD ["sh", "-c", "next start -p ${PORT:-3000}"]
