from django.db import models
from django.db.models import Q, F

# Create your models here.
from treeckle.common.models import TimestampedModel
from users.models import User
from venues.models import Venue


class BookingStatus(models.TextChoices):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"


class BookingStatusAction(models.TextChoices):
    REVOKE = "REVOKE"
    APPROVE = "APPROVE"
    REJECT = "REJECT"
    CANCEL = "CANCEL"


MAX_STATUS_LENGTH = max(map(len, BookingStatus))


class Booking(TimestampedModel):
    title = models.CharField(max_length=255)
    booker = models.ForeignKey(User, on_delete=models.CASCADE)
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE)
    start_date_time = models.DateTimeField()
    end_date_time = models.DateTimeField()
    status = models.CharField(
        max_length=MAX_STATUS_LENGTH,
        choices=BookingStatus.choices,
        default=BookingStatus.PENDING,
    )
    form_response_data = models.JSONField()

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=Q(start_date_time__lt=F("end_date_time")),
                name="booking_start_date_time_lt_end_date_time",
            )
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} | {self.status} | {self.venue.name} | {self.booker}"
