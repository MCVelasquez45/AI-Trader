FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
COPY services/api-gateway/package.json ./services/api-gateway/
RUN npm install
COPY services/api-gateway ./services/api-gateway
WORKDIR /app/services/api-gateway
RUN npm run build
EXPOSE 4000
CMD ["node", "dist/main.js"]
