FROM node:20-alpine AS build
ARG VITE_APP_API_URL
ARG VITE_APP_GOOGLE_CLIENT_ID
ARG VITE_APP_FACEBOOK_APP_ID
ARG VITE_APP_GA_TRACKING_ID
ARG PUBLIC_URL

## new issue appeared on 28/12/2021. Fix: https://github.com/docker/getting-started/issues/124
## git is required for semantic ui css fix
RUN apk add --no-cache --virtual .build-deps \
  python3 \
  make \
  g++ \
  git

## set custom working directory
WORKDIR /app

## copy project to working directory
COPY . .

## prepare container for building project
RUN yarn install

## build project
RUN NODE_OPTIONS=--max_old_space_size=4096 VITE_APP_API_URL=${VITE_APP_API_URL} VITE_APP_GOOGLE_CLIENT_ID=${VITE_APP_GOOGLE_CLIENT_ID} VITE_APP_FACEBOOK_APP_ID=${VITE_APP_FACEBOOK_APP_ID} VITE_APP_GA_TRACKING_ID=${VITE_APP_GA_TRACKING_ID} yarn build

## prepare nginx
FROM fholzer/nginx-brotli

## copy custom nginx config to override existing config
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

## serve react build in nginx
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 3000