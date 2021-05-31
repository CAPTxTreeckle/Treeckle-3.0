from rest_framework import serializers

from .models import Event, SubscriptionActionType, SignUpAction


class EventSerializer(serializers.ModelSerializer):
    start_date_time = serializers.IntegerField(min_value=0)
    end_date_time = serializers.IntegerField(min_value=0)
    image = serializers.CharField(allow_blank=True)
    categories = serializers.ListField(child=serializers.CharField(max_length=255))

    def validate(self, data):
        """
        Check that end_date_time is not before start_date_time.
        """
        if data["end_date_time"] < data["start_date_time"]:
            raise serializers.ValidationError(
                "Event end date/time cannot be before start date/time"
            )

        return data

    class Meta:
        model = Event
        fields = [
            "title",
            "organized_by",
            "venue_name",
            "description",
            "capacity",
            "start_date_time",
            "end_date_time",
            "image",
            "is_published",
            "is_sign_up_allowed",
            "is_sign_up_approval_required",
            "categories",
        ]


class EventCategoryTypeSubscriptionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(SubscriptionActionType.choices)
    category = serializers.CharField(max_length=255)


class PatchEventCategoryTypeSubscriptionSerializer(serializers.Serializer):
    actions = EventCategoryTypeSubscriptionSerializer(many=True)


class EventSignUpSerializer(serializers.Serializer):
    action = serializers.ChoiceField(SignUpAction.choices)
    user_id = serializers.IntegerField()


class PatchEventSignUpSerializer(serializers.Serializer):
    actions = EventSignUpSerializer(many=True)
