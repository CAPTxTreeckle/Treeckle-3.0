from django.contrib import admin

from .models import (
    Event,
    EventCategoryType,
    EventCategory,
    EventSignUp,
    EventCategoryTypeSubscription,
)

# Register your models here.
admin.site.register(Event)
admin.site.register(EventCategoryType)
admin.site.register(EventCategory)
admin.site.register(EventSignUp)
admin.site.register(EventCategoryTypeSubscription)
