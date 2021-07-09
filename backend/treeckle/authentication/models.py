from django.db import models

from treeckle.common.models import TimestampedModel

from users.models import User

# Create your models here.
class AuthenticationMethod(TimestampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    auth_id = models.CharField(max_length=100, unique=True)

    class Meta:
        abstract = True

    def __str__(self):
        return f"{self.user}"

    def is_valid(self, auth_id: str) -> bool:
        return self.auth_id == auth_id


class GmailAuthentication(AuthenticationMethod):
    pass


class OpenIdAuthentication(AuthenticationMethod):
    pass
