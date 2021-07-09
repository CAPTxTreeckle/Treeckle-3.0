from django.db import models

from organizations.models import Organization
from treeckle.common.models import TimestampedModel

# Create your models here.
class VenueCategory(TimestampedModel):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["name", "organization_id"],
                name="unique_organization_venue_category",
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.organization})"


class Venue(TimestampedModel):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    category = models.ForeignKey(VenueCategory, on_delete=models.CASCADE)
    capacity = models.PositiveIntegerField(blank=True, null=True)
    ic_name = models.CharField(max_length=255, blank=True)
    ic_email = models.EmailField(blank=True)
    ic_contact_number = models.CharField(max_length=50, blank=True)
    form_field_data = models.JSONField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["organization_id", "name"],
                name="unique_organization_venue_name",
            )
        ]

    def __str__(self):
        return f"{self.name} | {self.category}"


class BookingNotificationSubscription(TimestampedModel):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["email", "venue_id"],
                name="unique_email_venue_subscription",
            )
        ]

    def __str__(self):
        return f"{self.name} | {self.email} | {self.venue}"
