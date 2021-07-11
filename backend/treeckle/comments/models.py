from django.db import models

from treeckle.common.models import TimestampedModel
from users.models import User
from bookings.models import Booking

# Create your models here.


class Comment(TimestampedModel):
    commenter = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.id} | is_active: {self.is_active} | {self.commenter}"


class CommentRead(TimestampedModel):
    reader = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["reader_id", "comment_id"],
                name="unique_reader_comment",
            )
        ]


class BookingComment(models.Model):
    comment = models.OneToOneField(Comment, primary_key=True, on_delete=models.CASCADE)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.booking.id} | {self.comment}"
