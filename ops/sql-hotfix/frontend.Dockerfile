ARG BASE_IMAGE
FROM node:20-alpine AS assets
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM ${BASE_IMAGE}
RUN rm -rf /usr/share/nginx/html/*
COPY --from=assets /app/dist /usr/share/nginx/html
