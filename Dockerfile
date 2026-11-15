# syntax=docker/dockerfile:1
# Compiles index.ts and runs the sorting comparison once (npm run build is tsc, then node), then exits.
FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY tsconfig.json index.ts ./
CMD ["npm", "run", "build"]
