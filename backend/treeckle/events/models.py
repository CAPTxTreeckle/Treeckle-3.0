from django.db import models
from django.db.models import Q, F

from treeckle.common.models import TimestampedModel
from organizations.models import Organization
from users.models import User

# Create your models here.
class Event(TimestampedModel):
    title = models.CharField(max_length=255)
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    organized_by = models.CharField(max_length=255)
    venue_name = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    capacity = models.PositiveIntegerField(blank=True, null=True)
    start_date_time = models.DateTimeField()
    end_date_time = models.DateTimeField()
    image_url = models.URLField(blank=True)
    image_id = models.CharField(max_length=100, blank=True)
    is_published = models.BooleanField()
    is_sign_up_allowed = models.BooleanField()
    is_sign_up_approval_required = models.BooleanField()

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=Q(start_date_time__lte=F("end_date_time")),
                name="event_start_date_time_lte_end_date_time",
            )
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} | {self.creator}"


class EventCategoryType(TimestampedModel):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["name", "organization_id"],
                name="unique_organization_event_category_type",
            )
        ]
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.organization})"


class EventCategory(TimestampedModel):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    category = models.ForeignKey(EventCategoryType, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["category_id", "event_id"], name="unique_event_category"
            )
        ]

    def __str__(self):
        return f"{self.category.name} | {self.event}"


class SignUpStatus(models.TextChoices):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    ATTENDED = "ATTENDED"


class SignUpAction(models.TextChoices):
    ATTEND = "ATTEND"
    CONFIRM = "CONFIRM"
    REJECT = "REJECT"


class EventSignUp(TimestampedModel):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=50, choices=SignUpStatus.choices, default=SignUpStatus.PENDING
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user_id", "event_id"], name="unique_user_event_signup"
            )
        ]
        ordering = ["-status", "created_at"]

    def __str__(self):
        return f"{self.user.name} | {self.status} | {self.event}"


class SubscriptionActionType(models.TextChoices):
    SUBSCRIBE = "SUBSCRIBE"
    UNSUBSCRIBE = "UNSUBSCRIBE"


class EventCategoryTypeSubscription(TimestampedModel):
    category = models.ForeignKey(EventCategoryType, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["category_id", "user_id"],
                name="unique_user_event_category_type_subscription",
            )
        ]

    def __str__(self):
        return f"{self.user.name} | {self.category}"
