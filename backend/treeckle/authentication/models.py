from django.db import models

from treeckle.common.models import TimestampedModel

from users.models import User

# Create your models here.
class GmailAuthentication(TimestampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    auth_id = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return f"{self.user}"


class OpenIdAuthentication(TimestampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    auth_id = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return f"{self.user}"
