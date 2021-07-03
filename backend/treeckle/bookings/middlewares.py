from rest_framework.exceptions import NotFound, PermissionDenied

from users.models import User, Role
from bookings.models import Booking
from bookings.logic import get_bookings


def check_user_is_booker_or_admin(view_method):
    def _arguments_wrapper(
        instance, request, requester: User, booking_id: int, *args, **kwargs
    ):
        try:
            booking = (
                get_bookings(id=booking_id).select_related("booker", "venue").get()
            )

            is_admin = requester.role == Role.ADMIN
            is_booker = requester == booking.booker
            has_view_booking_permission = is_admin or is_booker

            if not has_view_booking_permission:
                raise PermissionDenied(
                    detail="No permission to access booking.",
                    code="no_access_booking_permission",
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
