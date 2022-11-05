FROM rust:1.65.0-alpine3.16 AS rustbuilder

WORKDIR /app

ENV GRPC_HOST=0.0.0.0:50053

RUN apk upgrade --update-cache --available && \
	apk add npm gcc cmake make g++

RUN npm install @a11ywatch/protos

COPY . .

RUN cargo install --no-default-features --path .

FROM node:19.0-alpine3.16 AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk upgrade --update-cache --available && \
	apk add openssl python3 make g++ && \
	rm -rf /var/cache/apk/*

RUN npm ci

COPY . .

RUN npm run build

FROM node:19.0-alpine3.16 AS installer

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

FROM node:19.0-alpine3.16

WORKDIR /usr/src/app

RUN apk upgrade --update-cache --available && \
	apk add openssl

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=installer /usr/src/app/node_modules ./node_modules
COPY --from=rustbuilder /usr/local/cargo/bin/health_client /usr/local/bin/health_client

CMD [ "node", "./dist/server.js" ]
