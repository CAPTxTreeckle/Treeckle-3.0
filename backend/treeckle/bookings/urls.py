from django.urls import path

from .views import (
    TotalBookingCountView,
    PendingBookingCountView,
    BookingsView,
    SingleBookingView,
)
from comments.views import BookingCommentsView

urlpatterns = [
    path("", BookingsView.as_view(), name="bookings"),
    path("totalcount", TotalBookingCountView.as_view(), name="total_count"),
    path(
        "pendingcount", PendingBookingCountView.as_view(), name="pending_count"
    ),
    path("<int:booking_id>", SingleBookingView.as_view(), name="single_booking"),
    path(
        "<int:booking_id>/comments",
        BookingCommentsView.as_view(),
        name="comments",
    ),
]
