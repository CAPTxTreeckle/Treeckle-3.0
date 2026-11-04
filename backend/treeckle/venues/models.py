from django.core.validators import (
    MaxValueValidator,
    MinValueValidator,
    RegexValidator,
)
from django.db import models

from organizations.models import Organization
from treeckle.common.models import TimestampedModel

DEFAULT_SHORT_NOTICE_DAYS = 7
DEFAULT_SHORT_NOTICE_TITLE = "Warning"
DEFAULT_SHORT_NOTICE_MESSAGE = (
    "Some of your selected time slots are coming up soon, so your booking "
    "may not be approved in time.\n\n"
    "Next time, please book further in advance."
)


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
    # stored without the leading "@"; Telegram usernames are 5-32 letters, digits or underscores
    ic_telegram_handle = models.CharField(
        max_length=32,
        blank=True,
        validators=[
            RegexValidator(
                r"^[A-Za-z0-9_]{5,32}$",
                "Telegram handle must be 5-32 letters, numbers or underscores.",
            )
        ],
    )
    form_field_data = models.JSONField()
    short_notice_enabled = models.BooleanField(default=True)
    short_notice_days = models.PositiveIntegerField(
        default=DEFAULT_SHORT_NOTICE_DAYS,
        validators=[MinValueValidator(1), MaxValueValidator(365)],
    )
    short_notice_title = models.CharField(
        max_length=255, default=DEFAULT_SHORT_NOTICE_TITLE
    )
    short_notice_message = models.TextField(default=DEFAULT_SHORT_NOTICE_MESSAGE)

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
