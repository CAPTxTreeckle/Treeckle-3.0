from rest_framework.exceptions import NotFound, PermissionDenied

from users.models import User, Role
from bookings.models import Booking
from .models import Comment
from bookings.logic import get_bookings
from .logic import get_comments


def check_user_is_booker_or_admin(view_method):
    def _arguments_wrapper(
        instance, request, requester: User, booking_id: int, *args, **kwargs
    ):
        try:
            booking = get_bookings(id=booking_id).select_related("booker").get()

            is_admin = requester.role == Role.ADMIN
            is_booker = requester == booking.booker
            has_view_booking_comment_permission = is_admin or is_booker

            if not has_view_booking_comment_permission:
                raise PermissionDenied(
                    detail="No permission to access booking comments.",
                    code="no_access_booking_comments_permission",
                )

        except (
            Booking.DoesNotExist,
            Booking.MultipleObjectsReturned,
            PermissionDenied,
        ) as e:
            raise NotFound(detail="No booking found.", code="no_booking_found")

        return view_method(
            instance, request, requester=requester, booking=booking, *args, **kwargs
        )

    return _arguments_wrapper


def check_user_is_commenter(view_method):
    def _arguments_wrapper(
        instance, request, requester: User, comment_id: int, *args, **kwargs
    ):
        try:
            comment = get_comments(id=comment_id).select_related("commenter").get()
            is_commenter = requester == comment.commenter

            if not is_commenter:
                raise PermissionDenied(
                    detail="No permission to access comment.",
                    code="no_access_comment_permission",
                )

        except (
            Comment.DoesNotExist,
            Comment.MultipleObjectsReturned,
            PermissionDenied,
        ) as e:
            raise NotFound(detail="No comment found.", code="no_comment_found")

        return view_method(
            instance, request, requester=requester, comment=comment, *args, **kwargs
        )

    return _arguments_wrapper
