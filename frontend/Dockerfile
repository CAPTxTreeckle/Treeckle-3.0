FROM node:25-alpine AS build
ARG MODE
ARG ENV_FILE

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
COPY ${ENV_FILE} .

## prepare container for building project
RUN yarn install

## build project
RUN NODE_OPTIONS=--max_old_space_size=4096 yarn build --mode=${MODE}

FROM busybox:1.37
WORKDIR /app
COPY --from=build /app/build .
CMD ["busybox", "httpd", "-f", "-v", "-p", "3000"]

EXPOSE 3000