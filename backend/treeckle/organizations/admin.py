from django.contrib import admin

from .models import Organization, OrganizationListener

# Register your models here.
admin.site.register(Organization)
admin.site.register(OrganizationListener)
