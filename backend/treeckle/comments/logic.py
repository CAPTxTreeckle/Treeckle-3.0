from django.db import transaction
from django.db.models import QuerySet

from treeckle.common.parsers import parse_datetime_to_ms_timestamp
from treeckle.common.constants import (
    ID,
    CREATED_AT,
    UPDATED_AT,
    CONTENT,
    COMMENTER,
    BOOKING_ID,
    IS_ACTIVE,
)
from .models import BookingComment, Comment
from bookings.models import Booking
from users.models import User
from users.logic import user_to_json

DELETED_COMMENT_MESSAGE = "This comment has been deleted."


def comment_to_json(comment: Comment) -> dict:
    return {
        ID: comment.id,
        CREATED_AT: parse_datetime_to_ms_timestamp(comment.created_at),
        UPDATED_AT: parse_datetime_to_ms_timestamp(comment.updated_at),
        COMMENTER: user_to_json(comment.commenter),
        CONTENT: comment.content if comment.is_active else DELETED_COMMENT_MESSAGE,
        IS_ACTIVE: comment.is_active,
    }


def booking_comment_to_json(booking_comment: BookingComment) -> dict:
    data = comment_to_json(booking_comment.comment)
    data.update({BOOKING_ID: booking_comment.booking.id})

    return data


def create_booking_comment(
    booking: Booking, commenter: User, content: str
) -> BookingComment:

    with transaction.atomic():
        comment = Comment.objects.create(commenter=commenter, content=content)

        booking_comment = BookingComment.objects.create(
            booking=booking, comment=comment
        )

    return booking_comment


def get_booking_comments(*args, **kwargs) -> QuerySet[BookingComment]:
    return BookingComment.objects.filter(*args, **kwargs)


def get_comments(*args, **kwargs) -> QuerySet[Comment]:
    return Comment.objects.filter(*args, **kwargs)


def update_comment(comment: Comment, content: str) -> Comment:
    comment.content = content
    comment.save()
    return comment


def delete_comment(comment: Comment) -> Comment:
    comment.is_active = False
    comment.save()

    return comment
