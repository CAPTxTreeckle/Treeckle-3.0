from rest_framework.exceptions import NotFound, PermissionDenied

from users.models import User, Role
from .models import Booking
from .logic import get_bookings


def check_requester_booking_same_organization(view_method):
    def _arguments_wrapper(
        instance, request, requester: User, booking_id: int, *args, **kwargs
    ):
        try:
            booking = (
                get_bookings(id=booking_id)
                .select_related(
                    "booker__organization",
                    "booker__profile_image",
                    "venue__organization",
                )
                .get()
            )

            if booking.venue.organization != requester.organization:
                raise PermissionDenied(
                    detail="User and booking are in different organizations.",
                    code="wrong_organization",
                )

        except (
            Booking.DoesNotExist,
            PermissionDenied,
        ):
            raise NotFound(detail="No booking found.", code="no_booking_found")

        return view_method(
            instance, request, requester=requester, booking=booking, *args, **kwargs
        )

    return _arguments_wrapper


def check_requester_is_booker_or_admin(view_method):
    def _arguments_wrapper(
        instance, request, requester: User, booking: Booking, *args, **kwargs
    ):
        try:
            is_admin = requester.role == Role.ADMIN
            is_booker = requester == booking.booker
            has_view_booking_permission = is_admin or is_booker

            if not has_view_booking_permission:
                raise PermissionDenied(
                    detail="No permission to access booking.",
                    code="no_access_booking_permission",
                )

        except PermissionDenied:
            raise NotFound(detail="No booking found.", code="no_booking_found")

        return view_method(
            instance, request, requester=requester, booking=booking, *args, **kwargs
        )

    return _arguments_wrapper
