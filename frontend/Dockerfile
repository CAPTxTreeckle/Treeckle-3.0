FROM node:16-alpine AS build
ARG REACT_APP_API_URL
ARG REACT_APP_GOOGLE_CLIENT_ID
ARG REACT_APP_FACEBOOK_APP_ID
ARG PUBLIC_URL

## new issue appeared on 28/12/2021. Fix: https://github.com/docker/getting-started/issues/124
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++

## set custom working directory
WORKDIR /app

## copy project to working directory
COPY . .

## prepare container for building project
RUN yarn install

## build project
RUN REACT_APP_API_URL=${REACT_APP_API_URL} REACT_APP_GOOGLE_CLIENT_ID=${REACT_APP_GOOGLE_CLIENT_ID} REACT_APP_FACEBOOK_APP_ID=${REACT_APP_FACEBOOK_APP_ID} PUBLIC_URL=${PUBLIC_URL} yarn build


## prepare nginx
FROM fholzer/nginx-brotli

## copy custom nginx config to override existing config
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

## serve react build in nginx
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 3000
