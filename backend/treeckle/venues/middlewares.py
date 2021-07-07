from rest_framework.exceptions import NotFound, PermissionDenied

from users.models import User
from .models import Venue, VenueBookingNotificationSubscription
from .logic import get_venues, get_booking_notification_subscriptions


def check_requester_venue_same_organization(view_method):
    def _arguments_wrapper(
        instance, request, requester: User, venue_id: int, *args, **kwargs
    ):
        try:
            venue = (
                get_venues(id=venue_id).select_related("category", "organization").get()
            )

            if venue.organization != requester.organization:
                raise PermissionDenied(
                    detail="User and venue are in different organizations.",
                    code="wrong_organization",
                )

        except (
            Venue.DoesNotExist,
            Venue.MultipleObjectsReturned,
            PermissionDenied,
        ) as e:
            raise NotFound(detail="No venue found.", code="no_venue_found")

        return view_method(
            instance, request, requester=requester, venue=venue, *args, **kwargs
        )

    return _arguments_wrapper


def check_requester_booking_notification_subscription_same_organization(
    view_method,
):
    def _arguments_wrapper(
        instance, request, requester: User, subscription_id: int, *args, **kwargs
    ):
        try:
            subscription = (
                get_booking_notification_subscriptions(id=subscription_id)
                .select_related("venue__organization")
                .get()
            )

            if subscription.venue.organization != requester.organization:
                raise PermissionDenied(
                    detail="User and booking notification subscription are in different organizations.",
                    code="wrong_organization",
                )

        except (
            VenueBookingNotificationSubscription.DoesNotExist,
            VenueBookingNotificationSubscription.MultipleObjectsReturned,
            PermissionDenied,
        ) as e:
            raise NotFound(
                detail="No booking notification subscription found.",
                code="no_booking_notification_subscription_found",
            )
        return view_method(
            instance,
            request,
            requester=requester,
            subscription=subscription,
            *args,
            **kwargs
        )

    return _arguments_wrapper
