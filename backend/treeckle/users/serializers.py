from rest_framework import serializers

from .models import User, UserInvite, Role, PatchUserAction


class PostSingleUserInviteSerializer(serializers.ModelSerializer):
    ## needed for role to be automatically assigned a default value
    role = serializers.ChoiceField(Role.choices, default=Role.RESIDENT)

    class Meta:
        model = UserInvite
        fields = ["email", "role"]


class PostUserInviteSerializer(serializers.Serializer):
    invitations = PostSingleUserInviteSerializer(many=True)


class PatchSingleUserInviteSerializer(serializers.ModelSerializer):
    ## needed to make role required
    role = serializers.ChoiceField(Role.choices)

    class Meta:
        model = UserInvite
        fields = ["role"]


class PatchSingleUserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=255, required=False)
    email = serializers.CharField(required=False)
    role = serializers.ChoiceField(Role.choices, required=False)

    class Meta:
        model = User
        fields = ["name", "email", "role"]


class PatchRequesterSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=PatchUserAction.choices)
    payload = serializers.JSONField(allow_null=True)


class NameSerializer(serializers.Serializer):
    name = serializers.CharField()


class ProfileImageSerializer(serializers.Serializer):
    profile_image = serializers.CharField()
