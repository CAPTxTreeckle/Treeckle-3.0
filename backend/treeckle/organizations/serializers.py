from rest_framework import serializers

from .models import OrganizationListener


class PostSingleOrganizationListenerSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationListener
        fields = ["name", "email"]
        extra_kwargs = {"email": {"validators": []}}


class PostOrganizationListenerSerializer(serializers.Serializer):
    listeners = PostSingleOrganizationListenerSerializer(many=True)


class DeleteOrganizationListenerSerializer(serializers.Serializer):
    ids = serializers.ListField(child=serializers.IntegerField())
