from django.urls import path

from .views import TotalBookingCountView, PendingBookingCountView, BookingsView

urlpatterns = [
    path("", BookingsView.as_view(), name="bookings"),
    path("totalcount", TotalBookingCountView.as_view(), name="total_count"),
    path("pendingcount", PendingBookingCountView.as_view(), name="pending_count"),
]
