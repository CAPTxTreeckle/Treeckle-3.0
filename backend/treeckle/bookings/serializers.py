from rest_framework import serializers

from .models import Booking, BookingStatus, BookingStatusAction


class GetBookingSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(required=False)
    venue_id = serializers.IntegerField(required=False)
    start_date_time = serializers.IntegerField(min_value=0, required=False)
    end_date_time = serializers.IntegerField(min_value=0, required=False)
    statuses = serializers.MultipleChoiceField(
        choices=BookingStatus.choices, required=False
    )
    full_details = serializers.BooleanField(default=False, required=False)

    def validate(self, data):
        """
        Check that start_date_time is before end_date_time.
        """
        if (
            "start_date_time" in data
            and "end_date_time" in data
            and data["start_date_time"] >= data["end_date_time"]
        ):
            raise serializers.ValidationError(
                "Booking start date/time must be before end date/time"
            )

        return data


class DateTimeRangeSerializer(serializers.Serializer):
    start_date_time = serializers.IntegerField(min_value=0)
    end_date_time = serializers.IntegerField(min_value=0)

    def validate(self, data):
        """
        Check that start_date_time is before end_date_time.
        """
        if data["start_date_time"] >= data["end_date_time"]:
            raise serializers.ValidationError(
                "Booking start date/time must be before end date/time"
            )

        return data


class PostBookingSerializer(serializers.ModelSerializer):
    venue_id = serializers.IntegerField()
    date_time_ranges = DateTimeRangeSerializer(many=True, allow_empty=False)

    class Meta:
        model = Booking
        fields = ["title", "venue_id", "date_time_ranges", "form_response_data"]


class PatchSingleBookingSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=BookingStatusAction.choices)
