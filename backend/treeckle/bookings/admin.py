from django.contrib import admin
from django.db import models

from django_json_widget.widgets import JSONEditorWidget

from .models import Booking

# Register your models here.
@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    formfield_overrides = {
        models.JSONField: {"widget": JSONEditorWidget},
    }
    search_fields = ['title__icontains', 'booker__name__icontains', 'booker__email__icontains','booker__organization__name__icontains','booker__role__icontains','venue__name__icontains', 'status__icontains']
