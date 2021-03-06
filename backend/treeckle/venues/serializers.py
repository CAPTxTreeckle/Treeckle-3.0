from rest_framework import serializers

from .models import Venue, BookingNotificationSubscription


class GetVenueSerializer(serializers.Serializer):
    category = serializers.CharField(max_length=255, required=False)
    full_details = serializers.BooleanField(default=False, required=False)


class VenueSerializer(serializers.ModelSerializer):
    category = serializers.CharField(max_length=255)

    class Meta:
        model = Venue
        fields = [
            "name",
            "category",
            "capacity",
            "ic_name",
            "ic_email",
            "ic_contact_number",
            "form_field_data",
        ]


class PostBookingNotificationSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingNotificationSubscription
        fields = ["name", "email"]
