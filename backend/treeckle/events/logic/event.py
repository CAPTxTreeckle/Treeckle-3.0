from typing import Optional, Iterable, Sequence
from datetime import datetime

from django.db.models import QuerySet
from django.db import transaction, IntegrityError

from treeckle.common.constants import (
    ID,
    CREATED_AT,
    UPDATED_AT,
    TITLE,
    CREATOR,
    ORGANIZED_BY,
    VENUE_NAME,
    DESCRIPTION,
    CAPACITY,
    START_DATE_TIME,
    END_DATE_TIME,
    IMAGE,
    CATEGORIES,
    IS_PUBLISHED,
    IS_SIGN_UP_ALLOWED,
    IS_SIGN_UP_APPROVAL_REQUIRED,
    SIGN_UP_COUNT,
    SIGN_UP_STATUS,
)
from treeckle.common.parsers import parse_datetime_to_ms_timestamp
from treeckle.common.validators import is_url
from content_delivery_service.logic.image import delete_image, upload_image
from organizations.models import Organization
from users.models import User
from users.logic import user_to_json
from events.models import Event, EventCategory, EventCategoryType, EventSignUp


def event_to_json(event: Event, user: User) -> dict:
    ##categories = EventCategory.objects.select_related("category").filter(event=event)

    try:
        sign_up_status = EventSignUp.objects.get(event=event, user=user).status
    except EventSignUp.DoesNotExist as e:
        sign_up_status = None

    return {
        ID: event.id,
        CREATED_AT: parse_datetime_to_ms_timestamp(event.created_at),
        UPDATED_AT: parse_datetime_to_ms_timestamp(event.updated_at),
        TITLE: event.title,
        ORGANIZED_BY: event.organized_by,
        CREATOR: user_to_json(event.creator),
        VENUE_NAME: event.venue_name,
        CAPACITY: str(event.capacity) if event.capacity else None,
        DESCRIPTION: event.description,
        CATEGORIES: [
            event_category.category.name
            for event_category in event.eventcategory_set.all()
        ],
        START_DATE_TIME: parse_datetime_to_ms_timestamp(event.start_date_time),
        END_DATE_TIME: parse_datetime_to_ms_timestamp(event.end_date_time),
        IMAGE: event.image_url,
        IS_PUBLISHED: event.is_published,
        IS_SIGN_UP_ALLOWED: event.is_sign_up_allowed,
        IS_SIGN_UP_APPROVAL_REQUIRED: event.is_sign_up_approval_required,
        SIGN_UP_COUNT: event.eventsignup_set.count(),
        SIGN_UP_STATUS: sign_up_status,
    }


def get_events(*args, **kwargs) -> QuerySet[Event]:
    return Event.objects.filter(*args, **kwargs)


def get_event_category_types(*args, **kwargs) -> QuerySet[EventCategoryType]:
    return EventCategoryType.objects.filter(*args, **kwargs)


def get_event_categories(*args, **kwargs) -> QuerySet[EventCategory]:
    return EventCategory.objects.filter(*args, **kwargs)


def get_or_create_event_category_type(
    name: str, organization: Organization
) -> EventCategoryType:
    event_category_type, _ = EventCategoryType.objects.get_or_create(
        name=name, organization=organization
    )
    return event_category_type


def delete_unused_event_category_types(organization: Organization) -> None:
    organization.eventcategorytype_set.filter(eventcategory=None).delete()


def create_event_categories(
    categories: Iterable[str], event: Event, organization: Organization
) -> Sequence[EventCategory]:
    event_categories_to_be_created = (
        EventCategory(
            event=event,
            category=get_or_create_event_category_type(
                name=category, organization=organization
            ),
        )
        for category in categories
    )

    new_event_categories = EventCategory.objects.bulk_create(
        event_categories_to_be_created, ignore_conflicts=True
    )

    return new_event_categories


def create_event(
    creator: User,
    title: str,
    organized_by: str,
    venue_name: str,
    description: str,
    capacity: Optional[int],
    start_date_time: datetime,
    end_date_time: datetime,
    image: str,
    is_published: bool,
    is_sign_up_allowed: bool,
    is_sign_up_approval_required: bool,
    categories: list[str],
) -> Event:
    image_id, image_url = upload_image(image)

    try:
        with transaction.atomic():
            new_event = Event.objects.create(
                title=title,
                creator=creator,
                organized_by=organized_by,
                venue_name=venue_name,
                description=description,
                capacity=capacity,
                start_date_time=start_date_time,
                end_date_time=end_date_time,
                image_url=image_url,
                image_id=image_id,
                is_published=is_published,
                is_sign_up_allowed=is_sign_up_allowed,
                is_sign_up_approval_required=is_sign_up_approval_required,
            )
            create_event_categories(
                categories=categories,
                event=new_event,
                organization=creator.organization,
            )

    except IntegrityError as e:
        delete_image(image_id)
        raise e

    return new_event


def update_event(
    current_event: Event,
    title: str,
    organized_by: str,
    venue_name: str,
    description: str,
    capacity: Optional[int],
    start_date_time: datetime,
    end_date_time: datetime,
    image: str,
    is_published: bool,
    is_sign_up_allowed: bool,
    is_sign_up_approval_required: bool,
    categories: list[str],
) -> Event:

    current_image_id, current_image_url = (
        current_event.image_id,
        current_event.image_url,
    )

    if is_url(image):
        new_image_id, new_image_url = current_image_id, current_image_url
    else:
        new_image_id, new_image_url = upload_image(image)

    try:
        with transaction.atomic():
            ## delete existing event categories and re-populate with latest categories
            get_event_categories(event=current_event).delete()
            create_event_categories(
                categories=categories,
                event=current_event,
                organization=current_event.creator.organization,
            )
            delete_unused_event_category_types(
                organization=current_event.creator.organization
            )

            current_event.update_from_dict(
                {
                    "title": title,
                    "organized_by": organized_by,
                    "venue_name": venue_name,
                    "description": description,
                    "capacity": capacity,
                    "start_date_time": start_date_time,
                    "end_date_time": end_date_time,
                    "image_url": new_image_url,
                    "image_id": new_image_id,
                    "is_published": is_published,
                    "is_sign_up_allowed": is_sign_up_allowed,
                    "is_sign_up_approval_required": is_sign_up_approval_required,
                },
                commit=True,
            )

    except IntegrityError as e:
        if current_image_id != new_image_id:
            delete_image(new_image_id)
        raise e

    if current_image_id != new_image_id:
        delete_image(current_image_id)

    return current_event
