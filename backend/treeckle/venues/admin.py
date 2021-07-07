from django.contrib import admin

from .models import VenueCategory, Venue, VenueBookingNotificationSubscription

# Register your models here.
admin.site.register(VenueCategory)
admin.site.register(Venue)
admin.site.register(VenueBookingNotificationSubscription)
