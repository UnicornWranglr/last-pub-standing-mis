FROM node:20-alpine

WORKDIR /app

# Install deps first for better layer caching
COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 4000

# Run migrations + seed, then start the API.
# Seed is idempotent (ON CONFLICT DO NOTHING on the owner user).
CMD ["sh", "-c", "node src/db/migrate.js && node src/db/seed.js && node src/index.js"]
