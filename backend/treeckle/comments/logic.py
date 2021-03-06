from django.db import transaction
from django.db.models import QuerySet

from treeckle.common.parsers import parse_datetime_to_ms_timestamp
from treeckle.common.constants import (
    ID,
    CREATED_AT,
    UPDATED_AT,
    CONTENT,
    COMMENTER,
    IS_ACTIVE,
)
from .models import BookingComment, Comment, CommentRead
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

    return data


@transaction.atomic
def create_booking_comment(
    booking: Booking, commenter: User, content: str
) -> BookingComment:

    comment = Comment.objects.create(commenter=commenter, content=content)

    booking_comment = BookingComment.objects.create(booking=booking, comment=comment)

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


def create_comment_reads(comment_ids: list[int], user: User) -> QuerySet[CommentRead]:
    comments = Comment.objects.filter(id__in=comment_ids)

    comment_reads = [CommentRead(comment=comment, reader=user) for comment in comments]
    created_comment_reads = CommentRead.objects.bulk_create(
        comment_reads, ignore_conflicts=True
    )

    return created_comment_reads
