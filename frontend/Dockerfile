FROM node:16-alpine AS build
ARG REACT_APP_API_URL
ARG REACT_APP_GOOGLE_CLIENT_ID

## set custom working directory
WORKDIR /app

## copy project to working directory
COPY . .

## prepare container for building project
RUN yarn install

## build project
RUN REACT_APP_API_URL=${REACT_APP_API_URL} REACT_APP_GOOGLE_CLIENT_ID=${REACT_APP_GOOGLE_CLIENT_ID} yarn build


## prepare nginx
FROM fholzer/nginx-brotli

## copy custom nginx config to override existing config
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

## serve react build in nginx
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 3000
