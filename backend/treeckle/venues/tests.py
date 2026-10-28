from django.test import TestCase

from organizations.models import Organization
from .logic import create_venue, update_venue, venue_to_json
from .models import DEFAULT_SHORT_NOTICE_DAYS, DEFAULT_SHORT_NOTICE_MESSAGE
from .serializers import VenueSerializer

VENUE_DATA = {
    "name": "Seminar Room",
    "category": "Seminar Rooms",
    "capacity": None,
    "ic_name": "",
    "ic_email": "",
    "ic_contact_number": "",
    "form_field_data": [],
}


class VenueShortNoticeTestCase(TestCase):
    def setUp(self):
        self.organization = Organization.objects.create(name="Test Organization")

    def create_test_venue(self, **short_notice_settings):
        return create_venue(
            organization=self.organization,
            venue_name=VENUE_DATA["name"],
            category_name=VENUE_DATA["category"],
            capacity=None,
            ic_name="",
            ic_email="",
            ic_contact_number="",
            ic_telegram_handle="",
            form_field_data=[],
            short_notice_settings=short_notice_settings,
        )

    def test_new_venue_uses_default_settings(self):
        venue = self.create_test_venue()

        data = venue_to_json(venue, full_details=True)

        self.assertTrue(data["short_notice_enabled"])
        self.assertEqual(data["short_notice_days"], DEFAULT_SHORT_NOTICE_DAYS)
        self.assertEqual(data["short_notice_message"], DEFAULT_SHORT_NOTICE_MESSAGE)

    def test_update_changes_only_given_settings(self):
        venue = self.create_test_venue(short_notice_days=14)

        update_venue(
            current_venue=venue,
            venue_name=VENUE_DATA["name"],
            category_name=VENUE_DATA["category"],
            capacity=None,
            ic_name="",
            ic_email="",
            ic_contact_number="",
            ic_telegram_handle="",
            form_field_data=[],
            short_notice_settings={"short_notice_enabled": False},
        )
        venue.refresh_from_db()

        self.assertFalse(venue.short_notice_enabled)
        self.assertEqual(venue.short_notice_days, 14)

    def test_serializer_rejects_invalid_days(self):
        for days in (0, 366):
            serializer = VenueSerializer(data={**VENUE_DATA, "short_notice_days": days})
            self.assertFalse(serializer.is_valid())
            self.assertIn("short_notice_days", serializer.errors)

    def test_serializer_validates_telegram_handle(self):
        for handle in ("venue_ic", ""):
            serializer = VenueSerializer(
                data={**VENUE_DATA, "ic_telegram_handle": handle}
            )
            self.assertTrue(serializer.is_valid(), serializer.errors)

        for handle in ("@venue_ic", "abc", "has space", "a" * 33):
            serializer = VenueSerializer(
                data={**VENUE_DATA, "ic_telegram_handle": handle}
            )
            self.assertFalse(serializer.is_valid())
            self.assertIn("ic_telegram_handle", serializer.errors)

    def test_serializer_omits_missing_settings(self):
        serializer = VenueSerializer(data=VENUE_DATA)

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertNotIn("short_notice_enabled", serializer.validated_data)
