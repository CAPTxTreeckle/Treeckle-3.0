from django.urls import path

from .views import TotalBookingCountView, PendingBookingCountView, BookingsView
from comments.views import BookingCommentsView

urlpatterns = [
    path("", BookingsView.as_view(), name="bookings"),
    path("totalcount", TotalBookingCountView.as_view(), name="total_booking_count"),
    path(
        "pendingcount", PendingBookingCountView.as_view(), name="pending_booking_count"
    ),
    path(
        "<int:booking_id>/comments",
        BookingCommentsView.as_view(),
        name="comments",
    ),
]
