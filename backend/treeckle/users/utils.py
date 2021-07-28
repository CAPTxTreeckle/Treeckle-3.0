from authentication.serializers import (
    PasswordAuthenticationSerializer,
    GoogleAuthenticationSerializer,
    FacebookAuthenticationSerializer,
)
from authentication.models import (
    PasswordAuthentication,
    GoogleAuthentication,
    FacebookAuthentication,
)
from .serializers import NameSerializer, ProfileImageSerializer
from .models import PatchUserAction


class ActionClasses:
    class PasswordAuthenticationClasses:
        serializer_class = PasswordAuthenticationSerializer
        auth_method_class = PasswordAuthentication
        auth_name = PatchUserAction.PASSWORD.lower()

    class GoogleAuthenticationClasses:
        serializer_class = GoogleAuthenticationSerializer
        auth_method_class = GoogleAuthentication
        auth_name = PatchUserAction.GOOGLE.lower()

    class FacebookAuthenticationClasses:
        serializer_class = FacebookAuthenticationSerializer
        auth_method_class = FacebookAuthentication
        auth_name = PatchUserAction.FACEBOOK.lower()

    class NameClasses:
        serializer_class = NameSerializer

    class ProfileImageClasses:
        serializer_class = ProfileImageSerializer

    @classmethod
    def get(cls: "ActionClasses", action: PatchUserAction):
        if action == PatchUserAction.PASSWORD:
            return cls.PasswordAuthenticationClasses

        if action == PatchUserAction.GOOGLE:
            return cls.GoogleAuthenticationClasses

        if action == PatchUserAction.FACEBOOK:
            return cls.FacebookAuthenticationClasses

        if action == PatchUserAction.NAME:
            return cls.NameClasses

        if action == PatchUserAction.PROFILE_IMAGE:
            return cls.ProfileImageClasses
