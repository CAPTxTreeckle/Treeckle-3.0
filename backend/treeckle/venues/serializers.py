from rest_framework import serializers

from .models import Venue


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