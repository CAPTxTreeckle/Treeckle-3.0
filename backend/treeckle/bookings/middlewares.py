from rest_framework.exceptions import NotFound, PermissionDenied

from users.models import User
from .models import Booking
from .logic import get_bookings


def check_requester_booking_same_organization(view_method):
    def _arguments_wrapper(
        instance, request, requester: User, booking_id: int, *args, **kwargs
    ):
        try:
            booking = (
                get_bookings(id=booking_id)
                .select_related("booker__organization", "venue__organization")
                .get()
            )

            if booking.venue.organization != requester.organization:
                raise PermissionDenied(
                    detail="User and booking are in different organizations.",
                    code="wrong_organization",
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
