FROM --platform=$BUILDPLATFORM rustlang/rust:nightly AS rustbuilder

WORKDIR /app

ENV GRPC_HOST=0.0.0.0:50053

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    gcc cmake libc6 npm

RUN npm install @a11ywatch/protos

COPY . .

RUN cargo install --no-default-features --path .

FROM --platform=$BUILDPLATFORM node:17.8-alpine3.14 AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk upgrade --update-cache --available && \
	apk add openssl python3 make g++ && \
	rm -rf /var/cache/apk/*

RUN npm ci

COPY . .

RUN npm run build

FROM node:18.7-buster-slim AS installer

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

FROM node:18.7-buster-slim

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=installer /usr/src/app/node_modules ./node_modules
COPY --from=rustbuilder /usr/local/cargo/bin/health_client /usr/local/bin/health_client

CMD [ "node", "./dist/server.js" ]
