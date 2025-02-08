#!/bin/sh

# Keep the line endings for this file as LF.
# https://stackoverflow.com/questions/44460825/entrypoint-file-not-found

if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $SQL_HOST $SQL_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi

python treeckle/manage.py migrate --no-input
python treeckle/manage.py initsuperuser --username="$SUPERUSER" --email="$SUPERUSER_EMAIL" --password="$SUPERUSER_PASSWORD"
python treeckle/manage.py collectstatic --no-input --clear

exec "$@"