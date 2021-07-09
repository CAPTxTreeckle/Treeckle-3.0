from django.contrib import admin

from .models import VenueCategory, Venue, BookingNotificationSubscription

# Register your models here.
admin.site.register(VenueCategory)
admin.site.register(Venue)
admin.site.register(BookingNotificationSubscription)
