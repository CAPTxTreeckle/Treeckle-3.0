from abc import ABC, abstractmethod
from typing import Optional

from django.db import models, transaction
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError, NON_FIELD_ERRORS

from treeckle.common.exceptions import BadRequest
from treeckle.common.models import TimestampedModel

from users.models import User, UserInvite


## DB models
class AuthenticationMethod(TimestampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    auth_id = models.CharField(max_length=255, unique=True)

    class Meta:
        abstract = True

    def __str__(self):
        return f"{self.user}"

    def is_valid(self, auth_id: str) -> bool:
        return self.auth_id == auth_id

    @classmethod
    def create(cls, user: User, auth_id: str):
        auth_method = cls(user=user, auth_id=auth_id)

        auth_method.save()

        return auth_method

    @classmethod
    def get_related_name(cls):
        return cls.__name__.lower()


## Alternative auth methods
class GoogleAuthentication(AuthenticationMethod):
    pass


class FacebookAuthentication(AuthenticationMethod):
    pass


class OpenIdAuthentication(AuthenticationMethod):
    pass


## IMPORTANT: to be updated every time the alternative auth methods are updated
ALTERNATIVE_AUTH_METHODS = [
    GoogleAuthentication,
    FacebookAuthentication,
    OpenIdAuthentication,
]


class PasswordAuthentication(AuthenticationMethod):
    def is_valid(self, auth_id: str):
        return check_password(auth_id, self.auth_id)

    @classmethod
    def create(cls, user: User, password: str, check_alt_methods: bool = True):
        if check_alt_methods and any(
            hasattr(user, method.get_related_name())
            for method in ALTERNATIVE_AUTH_METHODS
        ):
            return None

        try:
            validate_password(password)
        except ValidationError as e:
            detail = "\n".join(e.messages) if type(e.messages) != str else e.message
            raise BadRequest(detail=detail, code="bad_password")

        hashed_password = make_password(password)
        return super().create(user, hashed_password)


## Non DB models
class AuthenticationData(ABC):
    @abstractmethod
    def __init__(
        self,
        name: str,
        email: str,
        auth_id: str,
        auth_method_class: AuthenticationMethod,
        profile_image: str = "",
    ):
        self.name = name
        self.email = email
        self.auth_id = auth_id
        self.auth_method_class = auth_method_class
        self.profile_image = profile_image

    def __str__(self):
        return f"{self.name} | {self.email} | {self.auth_id} | {self.profile_image}"

    @transaction.atomic
    def authenticate(self) -> Optional[User]:
        ## check if an invite exists
        try:
            user_invite = UserInvite.objects.select_related("organization").get(
                email=self.email
            )
        except UserInvite.DoesNotExist as e:
            user_invite = None

        ## check if is existing user
        try:
            user = User.objects.select_related("organization").get(
                email=self.email,
            )
        except User.DoesNotExist as e:
            user = None

        ## no existing user nor user invite
        if user is None and user_invite is None:
            return None

        ## user invite exists but not user
        if user is None:
            ## create a new user and delete user invite
            user = User.objects.create(
                organization=user_invite.organization,
                name=self.name,
                email=self.email,
                profile_image=self.profile_image,
                role=user_invite.role,
            )
        ## update profile image if possible
        elif not user.profile_image and self.profile_image:
            user.profile_image = self.profile_image
            user.save()

        ## since user exists, user invite should be deleted if it exists
        if user_invite is not None:
            ## delete user invite
            user_invite.delete()

        try:
            auth_method = self.auth_method_class.objects.get(user=user)
            ## matches with given auth_id
            return user if auth_method.is_valid(self.auth_id) else None
        except self.auth_method_class.DoesNotExist:
            ## proceed to create auth method for user
            pass

        ## try to create auth method for user
        new_auth_method = self.auth_method_class.create(user, self.auth_id)

        return user if new_auth_method is not None else None


class GoogleAuthenticationData(AuthenticationData):
    def __init__(self, name: str, email: str, auth_id: str, profile_image: str):
        super().__init__(
            name=name,
            email=email,
            auth_id=auth_id,
            auth_method_class=GoogleAuthentication,
            profile_image=profile_image,
        )


class FacebookAuthenticationData(AuthenticationData):
    def __init__(self, name: str, email: str, auth_id: str, profile_image: str):
        super().__init__(
            name=name,
            email=email,
            auth_id=auth_id,
            auth_method_class=FacebookAuthentication,
            profile_image=profile_image,
        )


class OpenIdAuthenticationData(AuthenticationData):
    def __init__(self, name: str, email: str, auth_id: str):
        super().__init__(
            name=name,
            email=email,
            auth_id=auth_id,
            auth_method_class=OpenIdAuthentication,
        )


class PasswordAuthenticationData(AuthenticationData):
    def __init__(self, name: str, email: str, auth_id: str):
        super().__init__(
            name=name,
            email=email,
            auth_id=auth_id,
            auth_method_class=PasswordAuthentication,
        )
