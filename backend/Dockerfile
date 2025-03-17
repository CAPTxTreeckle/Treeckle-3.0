FROM python:3.13.2-alpine

## set custom working directory
WORKDIR /app

## set environment variables
## PYTHONDONTWRITEBYTECODE: Prevents Python from writing pyc files to disc (equivalent to python -B option)
## PYTHONUNBUFFERED: Prevents Python from buffering stdout and stderr (equivalent to python -u option)
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

## install dependencies
RUN pip install --upgrade pip
COPY ./requirements.txt .
RUN apk update && \
    apk add postgresql-libs && \
    apk add --no-cache --virtual .build-deps \
    gcc \
    musl-dev \
    postgresql-dev \
    libffi-dev \
    && pip install --no-cache-dir -r requirements.txt \
    && apk del --no-cache .build-deps

## copy project to working directory
COPY . .

## run entrypoint.sh
ENTRYPOINT [ "/app/entrypoint.sh" ]
