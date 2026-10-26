from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from organizations.models import Organization
from users.models import Role, User
from venues.models import Venue, VenueCategory

from .logic import get_booking_analytics
from .models import Booking, BookingStatus


class BookingAnalyticsLogicTests(TestCase):
    def setUp(self):
        self.organization = Organization.objects.create(name="Analytics Organization")
        self.other_organization = Organization.objects.create(name="Other Organization")
        self.user = User.objects.create(
            organization=self.organization,
            name="Analytics Admin",
            email="analytics-admin@example.com",
            role=Role.ADMIN,
        )
        self.other_user = User.objects.create(
            organization=self.other_organization,
            name="Other Admin",
            email="other-admin@example.com",
            role=Role.ADMIN,
        )
        self.venue = self.create_venue(self.organization, "Analytics Hall")
        self.other_venue = self.create_venue(self.other_organization, "Other Hall")

    def create_venue(self, organization, name):
        category = VenueCategory.objects.create(organization=organization, name=name)
        return Venue.objects.create(
            organization=organization,
            name=name,
            category=category,
            form_field_data=[],
        )

    def create_booking(self, venue, user, start, end, status):
        return Booking.objects.create(
            title="Test booking",
            booker=user,
            venue=venue,
            start_date_time=start,
            end_date_time=end,
            status=status,
            form_response_data=[],
        )

    def test_past_analytics_returns_organization_scoped_status_counts(self):
        now = timezone.now()
        start = now - timedelta(hours=2)
        self.create_booking(
            self.venue,
            self.user,
            start,
            start + timedelta(hours=1),
            BookingStatus.APPROVED,
        )
        self.create_booking(
            self.venue,
            self.user,
            start + timedelta(minutes=30),
            start + timedelta(hours=1),
            BookingStatus.PENDING,
        )
        self.create_booking(
            self.venue,
            self.user,
            start + timedelta(minutes=45),
            start + timedelta(hours=1),
            BookingStatus.REJECTED,
        )
        self.create_booking(
            self.venue,
            self.user,
            start + timedelta(minutes=50),
            start + timedelta(hours=1),
            BookingStatus.CANCELLED,
        )
        self.create_booking(
            self.other_venue,
            self.other_user,
            start,
            start + timedelta(hours=3),
            BookingStatus.APPROVED,
        )

        second_user = User.objects.create(
            organization=self.organization,
            name="Second Booker",
            email="second-booker@example.com",
            role=Role.RESIDENT,
        )
        self.create_booking(
            self.venue,
            second_user,
            start + timedelta(minutes=55),
            start + timedelta(hours=1),
            BookingStatus.PENDING,
        )

        analytics = get_booking_analytics(self.organization, "past", 1)

        for removed_field in [
            "weekday_hour_counts",
            "total_requests",
            "approved_booked_hours",
            "venues_used",
        ]:
            self.assertNotIn(removed_field, analytics)
        self.assertEqual(
            analytics["venue_breakdown"][0]["venue_name"], "Analytics Hall"
        )
        self.assertEqual(analytics["venue_breakdown"][0]["approved_count"], 1)
        self.assertEqual(analytics["venue_breakdown"][0]["pending_count"], 2)
        self.assertEqual(analytics["venue_breakdown"][0]["rejected_count"], 1)
        self.assertEqual(analytics["venue_breakdown"][0]["cancelled_count"], 1)
        self.assertEqual(analytics["unique_bookers"], 2)
        self.assertEqual(
            analytics["booker_frequency"],
            [
                {"label": "1 booking", "count": 1},
                {"label": "2–3 bookings", "count": 0},
                {"label": "4+ bookings", "count": 1},
            ],
        )

    def test_future_analytics_only_includes_future_bookings(self):
        now = timezone.now()
        future_start = now + timedelta(hours=1)
        self.create_booking(
            self.venue,
            self.user,
            future_start,
            future_start + timedelta(hours=1),
            BookingStatus.APPROVED,
        )
        self.create_booking(
            self.venue,
            self.user,
            now - timedelta(hours=1),
            now,
            BookingStatus.PENDING,
        )

        analytics = get_booking_analytics(self.organization, "future", 1)

        self.assertEqual(len(analytics["venue_breakdown"]), 1)
        self.assertEqual(analytics["venue_breakdown"][0]["approved_count"], 1)
        self.assertEqual(analytics["venue_breakdown"][0]["pending_count"], 0)
