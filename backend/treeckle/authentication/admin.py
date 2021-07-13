from django.contrib import admin

from .models import GoogleAuthentication, OpenIdAuthentication, PasswordAuthentication

# Register your models here.
admin.site.register(GoogleAuthentication)
admin.site.register(OpenIdAuthentication)
admin.site.register(PasswordAuthentication)
