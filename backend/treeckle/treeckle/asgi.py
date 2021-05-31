"""
ASGI config for treeckle project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

# use for dev
from dotenv import load_dotenv

load_dotenv(".env.backend.dev")

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "treeckle.settings")

application = get_asgi_application()
