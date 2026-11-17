# syntax=docker/dockerfile:1
# Imagem do site (spec §8.7, ADR-019): build do Vite → nginx não root na porta 8080.

FROM node:24.22.3-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Site e API na mesma origem: as chamadas vão para /api (o ALB leva ao fiapx-video-api). Sem mock em produção.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} VITE_USE_MOCKS=false
RUN npm run build && rm -f dist/mockServiceWorker.js

FROM nginxinc/nginx-unprivileged:1.29.8-alpine
# Correções de segurança dos pacotes do Alpine publicadas depois da imagem base (o Trivy do CI barra CRITICAL).
USER root
RUN apk upgrade --no-cache
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
# UID numérico: o EKS exige runAsNonRoot e não aceita usuário por nome (ver ambientes.md).
USER 101:101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
