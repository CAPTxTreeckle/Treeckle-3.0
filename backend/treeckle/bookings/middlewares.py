from rest_framework.exceptions import NotFound

from users.models import User
from bookings.models import Booking
from bookings.logic import get_bookings


def check_booking_exists(view_method):
    def _arguments_wrapper(
        instance, request, requester: User, booking_id: int, *args, **kwargs
    ):
        try:
            booking = (
                get_bookings(id=booking_id).select_related("booker", "venue").get()
            )

        except (
            Booking.DoesNotExist,
            Booking.MultipleObjectsReturned,
        ) as e:
            raise NotFound(detail="No booking found.", code="no_booking_found")

        return view_method(
            instance, request, requester=requester, booking=booking, *args, **kwargs
        )

    return _arguments_wrapper
