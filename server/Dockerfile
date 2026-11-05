FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm i -D typescript --no-audit --no-fund
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc -p tsconfig.json && npm prune --omit=dev
ENV NODE_ENV=production PORT=4005
EXPOSE 4005
CMD ["node", "dist/index.js"]
