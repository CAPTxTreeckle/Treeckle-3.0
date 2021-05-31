from rest_framework import serializers

from .models import User, UserInvite, Role


class PostSingleUserInviteSerializer(serializers.ModelSerializer):
    ## needed for role to be automatically assigned a default value
    role = serializers.ChoiceField(Role.choices, default=Role.RESIDENT)

    class Meta:
        model = UserInvite
        fields = ["email", "role"]
        extra_kwargs = {"email": {"validators": []}}


class PostUserInviteSerializer(serializers.Serializer):
    invitations = PostSingleUserInviteSerializer(many=True)


class PatchSingleUserInviteSerializer(serializers.ModelSerializer):
    ## needed to access id field
    id = serializers.IntegerField()
    ## needed to make role required
    role = serializers.ChoiceField(Role.choices)

    class Meta:
        model = UserInvite
        fields = ["id", "role"]


class PatchUserInviteSerializer(serializers.Serializer):
    users = PatchSingleUserInviteSerializer(many=True)


class EmailListSerializer(serializers.Serializer):
    emails = serializers.ListField(child=serializers.EmailField())


class PatchSingleUserSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    name = serializers.CharField(max_length=255, required=False)
    email = serializers.CharField(required=False)
    role = serializers.ChoiceField(Role.choices, required=False)

    class Meta:
        model = User
        fields = ["id", "name", "email", "role"]


class PatchUserSerializer(serializers.Serializer):
    users = PatchSingleUserSerializer(many=True)