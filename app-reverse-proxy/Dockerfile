FROM nginx:1.21.0-alpine

## copy custom nginx config to override default config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./nginx-base.conf /etc/nginx/sites-available/treeckle.com/nginx-base.conf

EXPOSE 80