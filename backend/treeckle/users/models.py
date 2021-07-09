from django.db import models

from treeckle.common.models import TimestampedModel
from organizations.models import Organization

# Create your models here.


class Role(models.TextChoices):
    ADMIN = "ADMIN"
    ORGANIZER = "ORGANIZER"
    RESIDENT = "RESIDENT"


MAX_ROLE_LENGTH = max(map(len, Role))


class User(TimestampedModel):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=MAX_ROLE_LENGTH, choices=Role.choices, default=Role.RESIDENT
    )
    profile_image = models.URLField(blank=True)

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
