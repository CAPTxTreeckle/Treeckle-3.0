from django.db import models
from django.contrib.auth.hashers import check_password, make_password

from treeckle.common.models import TimestampedModel

from users.models import User

# Create your models here.
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
class GmailAuthentication(AuthenticationMethod):
    pass


class OpenIdAuthentication(AuthenticationMethod):
    pass


## IMPORTANT: to be updated every time the alternative auth methods are updated
ALTERNATIVE_AUTH_METHODS = [GmailAuthentication, OpenIdAuthentication]


class PasswordAuthentication(AuthenticationMethod):
    def is_valid(self, auth_id):
        return check_password(auth_id, self.auth_id)

    @classmethod
    def create(cls, user, password):
        if any(
            hasattr(user, method.get_related_name())
            for method in ALTERNATIVE_AUTH_METHODS
        ):
            return None

        hashed_password = make_password(password)
        return super().create(user, hashed_password)
