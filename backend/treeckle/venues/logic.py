from typing import Optional

from django.db.models import QuerySet
from django.db import transaction

from treeckle.common.constants import (
    ID,
    CREATED_AT,
    UPDATED_AT,
    NAME,
    CATEGORY,
    CAPACITY,
    IC_NAME,
    IC_EMAIL,
    IC_CONTACT_NUMBER,
    FORM_FIELD_DATA,
    ORGANIZATION,
    EMAIL,
    VENUE,
)
from treeckle.common.parsers import parse_datetime_to_ms_timestamp
from organizations.models import Organization
from .models import VenueCategory, Venue, BookingNotificationSubscription


def venue_to_json(venue: Venue, full_details: bool = False) -> dict:
    data = {
        ID: venue.id,
        CREATED_AT: parse_datetime_to_ms_timestamp(venue.created_at),
        UPDATED_AT: parse_datetime_to_ms_timestamp(venue.updated_at),
        NAME: venue.name,
    }

    if full_details:
        data.update(
            {
                ORGANIZATION: venue.organization.name,
                CATEGORY: venue.category.name,
                CAPACITY: str(venue.capacity) if venue.capacity else None,
                IC_NAME: venue.ic_name,
                IC_EMAIL: venue.ic_email,
                IC_CONTACT_NUMBER: venue.ic_contact_number,
                FORM_FIELD_DATA: venue.form_field_data,
            }
        )

    return data


def booking_notification_subscription_to_json(
    subscription: BookingNotificationSubscription,
) -> dict:
    return {
        ID: subscription.id,
        CREATED_AT: parse_datetime_to_ms_timestamp(subscription.created_at),
        UPDATED_AT: parse_datetime_to_ms_timestamp(subscription.updated_at),
        NAME: subscription.name,
        EMAIL: subscription.email,
        VENUE: venue_to_json(subscription.venue, full_details=False),
    }


def get_venue_categories(*args, **kwargs) -> QuerySet[VenueCategory]:
    return VenueCategory.objects.filter(*args, **kwargs)


def get_venues(*args, **kwargs) -> QuerySet[Venue]:
    return Venue.objects.filter(*args, **kwargs)


def get_booking_notification_subscriptions(
    *args, **kwargs
) -> QuerySet[BookingNotificationSubscription]:
    return BookingNotificationSubscription.objects.filter(*args, **kwargs)


def get_requested_venues(
    organization: Organization, category: Optional[str]
) -> QuerySet[Venue]:
    filtered_venues = get_venues(organization=organization)

    if category is not None:
        filtered_venues = filtered_venues.filter(category__name=category)

    return filtered_venues


def get_or_create_venue_category(
    name: str, organization: Organization
) -> VenueCategory:
    venue_category, _ = VenueCategory.objects.get_or_create(
        name=name, organization=organization
    )

    return venue_category


def delete_unused_venue_categories(organization: Organization):
    organization.venuecategory_set.filter(venue=None).delete()


@transaction.atomic
def create_venue(
    organization: Organization,
    venue_name: str,
    category_name: str,
    capacity: Optional[int],
    ic_name: str,
    ic_email: str,
    ic_contact_number: str,
    form_field_data: list[dict],
) -> Venue:

    venue_category = get_or_create_venue_category(
        name=category_name, organization=organization
    )

    new_venue = Venue.objects.create(
        organization=organization,
        name=venue_name,
        category=venue_category,
        capacity=capacity,
        ic_name=ic_name,
        ic_email=ic_email,
        ic_contact_number=ic_contact_number,
        form_field_data=form_field_data,
    )

    return new_venue


@transaction.atomic
def update_venue(
    current_venue: Venue,
    venue_name: str,
    category_name: str,
    capacity: Optional[int],
    ic_name: str,
    ic_email: str,
    ic_contact_number: str,
    form_field_data: list[dict],
) -> Venue:

    venue_category = get_or_create_venue_category(
        name=category_name, organization=current_venue.organization
    )

    current_venue.update_from_dict(
        {
            "name": venue_name,
            "category": venue_category,
            "capacity": capacity,
            "ic_name": ic_name,
            "ic_email": ic_email,
            "ic_contact_number": ic_contact_number,
            "form_field_data": form_field_data,
        },
        commit=True,
    )

    delete_unused_venue_categories(organization=current_venue.organization)

    return current_venue
