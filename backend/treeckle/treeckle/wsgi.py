"""
WSGI config for treeckle project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

# use for dev
from dotenv import load_dotenv

load_dotenv(".env.backend.dev")

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "treeckle.settings")

application = get_wsgi_application()
