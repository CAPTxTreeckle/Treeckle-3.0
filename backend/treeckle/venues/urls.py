from django.urls import path

from .views import (
    VenueCategoriesView,
    BookingNotificationSubscriptionsView,
    SingleBookingNotificationSubscriptionView,
    SingleVenueBookingNotificationSubscriptionsView,
    VenuesView,
    SingleVenueView,
)

urlpatterns = [
    path("", VenuesView.as_view(), name="venues"),
    path("categories", VenueCategoriesView.as_view(), name="categories"),
    path(
        "subscriptions",
        BookingNotificationSubscriptionsView.as_view(),
        name="booking_notification_subscriptions",
    ),
    path(
        "subscriptions/<int:subscription_id>",
        SingleBookingNotificationSubscriptionView.as_view(),
        name="single_booking_notification_subscription",
    ),
    path("<int:venue_id>", SingleVenueView.as_view(), name="single_venue"),
    path(
        "<int:venue_id>/subscriptions",
        SingleVenueBookingNotificationSubscriptionsView.as_view(),
        name="single_venue_booking_notification_subscriptions",
    ),
]
