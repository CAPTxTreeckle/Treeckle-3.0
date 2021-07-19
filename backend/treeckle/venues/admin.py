from django.contrib import admin
from django.db import models

from django_json_widget.widgets import JSONEditorWidget

from .models import VenueCategory, Venue, BookingNotificationSubscription

# Register your models here.
admin.site.register(VenueCategory)
admin.site.register(BookingNotificationSubscription)


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    formfield_overrides = {
        models.JSONField: {"widget": JSONEditorWidget},
    }
