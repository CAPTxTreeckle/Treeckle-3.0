from django.contrib import admin

from .models import GmailAuthentication, OpenIdAuthentication

# Register your models here.
admin.site.register(GmailAuthentication)
admin.site.register(OpenIdAuthentication)
