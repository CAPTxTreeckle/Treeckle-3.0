from django.contrib import admin

from .models import (
    GoogleAuthentication,
    FacebookAuthentication,
    OpenIdAuthentication,
    PasswordAuthentication,
)

# Register your models here.
admin.site.register(GoogleAuthentication)
admin.site.register(FacebookAuthentication)
admin.site.register(OpenIdAuthentication)
admin.site.register(PasswordAuthentication)
