from typing import Optional

from django.db import models

from treeckle.common.models import TimestampedModel
from organizations.models import Organization
from content_delivery_service.models import Image


# Create your models here.


class PatchUserAction(models.TextChoices):
    PASSWORD = "PASSWORD"
    GOOGLE = "GOOGLE"
    FACEBOOK = "FACEBOOK"
    NAME = "NAME"
    PROFILE_IMAGE = "PROFILE_IMAGE"


class Role(models.TextChoices):
    ADMIN = "ADMIN"
    ORGANIZER = "ORGANIZER"
    RESIDENT = "RESIDENT"


MAX_ROLE_LENGTH = max(map(len, Role))


class User(TimestampedModel):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=MAX_ROLE_LENGTH, choices=Role.choices, default=Role.RESIDENT
    )
    profile_image = models.ForeignKey(Image, null=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f"{self.name} | {self.email} ({self.organization})"


class UserInvite(TimestampedModel):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=MAX_ROLE_LENGTH, choices=Role.choices, default=Role.RESIDENT
    )

    def __str__(self):
        return f"{self.email} ({self.organization})"
