from django.contrib import admin
from django.db import models

from django_json_widget.widgets import JSONEditorWidget

from .models import Booking

# Register your models here.
@admin.register(Booking)
class VenueAdmin(admin.ModelAdmin):
    formfield_overrides = {
        models.JSONField: {"widget": JSONEditorWidget},
    }
