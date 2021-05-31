from django.db import models
from treeckle.common.models import TimestampedModel

# Create your models here.
class Organization(TimestampedModel):
    name = models.CharField(max_length=255, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class OrganizationListener(TimestampedModel):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    email = models.EmailField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["email", "organization_id"],
                name="unique_organization_listener",
            )
        ]
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} | {self.email} ({self.organization})"