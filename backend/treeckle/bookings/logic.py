from typing import Iterable, Sequence, Optional
from datetime import datetime
from collections import namedtuple

from django.db.models import QuerySet, Q
from django.db import transaction

from rest_framework.exceptions import PermissionDenied

from treeckle.common.constants import (
    ID,
    CREATED_AT,
    UPDATED_AT,
    TITLE,
    VENUE,
    BOOKER,
    START_DATE_TIME,
    END_DATE_TIME,
    STATUS,
    FORM_RESPONSE_DATA,
    COMMENTS,
)
from treeckle.common.exceptions import BadRequest
from treeckle.common.parsers import parse_datetime_to_ms_timestamp
from organizations.models import Organization
from users.logic import user_to_json
from users.models import User, Role
from venues.models import Venue
from venues.logic import venue_to_json
from .models import Booking, BookingStatusAction, BookingStatus
from comments.logic import booking_comment_to_json, get_booking_comments

DateTimeInterval = namedtuple(
    "DateTimeInterval", ["start", "end", "is_new"], defaults=[True]
)


def is_intersecting(interval_A: DateTimeInterval, interval_B: DateTimeInterval) -> bool:
    return not (
        interval_A.end <= interval_B.start or interval_A.start >= interval_B.end
    )


def get_non_overlapping_date_time_intervals(
    date_time_intervals: Iterable[DateTimeInterval],
) -> Sequence[DateTimeInterval]:
    sorted_date_time_intervals = sorted(date_time_intervals)

    non_overlapping_date_time_intervals = []

    for date_time_interval in sorted_date_time_intervals:
        while non_overlapping_date_time_intervals and is_intersecting(
            non_overlapping_date_time_intervals[-1], date_time_interval
        ):
            if date_time_interval.is_new:
                ## does not go to else clause
                break

            non_overlapping_date_time_intervals.pop()
        else:
            ## only adds non-overlapping intervals
            non_overlapping_date_time_intervals.append(date_time_interval)

    return non_overlapping_date_time_intervals


def booking_to_json(booking: Booking, include_comments: bool = False):
    data = {
        ID: booking.id,
        CREATED_AT: parse_datetime_to_ms_timestamp(booking.created_at),
        UPDATED_AT: parse_datetime_to_ms_timestamp(booking.updated_at),
        TITLE: booking.title,
        BOOKER: user_to_json(booking.booker),
        VENUE: venue_to_json(booking.venue, full_details=False),
        START_DATE_TIME: parse_datetime_to_ms_timestamp(booking.start_date_time),
        END_DATE_TIME: parse_datetime_to_ms_timestamp(booking.end_date_time),
        STATUS: booking.status,
        FORM_RESPONSE_DATA: booking.form_response_data,
    }

    if include_comments:
        booking_comments = get_booking_comments(booking=booking).select_related(
            "comment__commenter__organization", "booking"
        )

        data.update(
            {
                COMMENTS: [
                    booking_comment_to_json(comment) for comment in booking_comments
                ]
            }
        )

    return data


def get_bookings(*args, **kwargs) -> QuerySet[Booking]:
    return Booking.objects.filter(*args, **kwargs)


def get_requested_bookings(
    organization: Organization,
    user_id: Optional[int],
    venue_id: Optional[int],
    start_date_time: datetime,
    end_date_time: datetime,
    status: Optional[BookingStatus],
) -> QuerySet[Booking]:
    filtered_bookings = (
        get_bookings(venue__organization=organization)
        .exclude(end_date_time__lte=start_date_time)
        .exclude(start_date_time__gte=end_date_time)
    )

    if user_id is not None:
        filtered_bookings = filtered_bookings.filter(booker_id=user_id)

    if venue_id is not None:
        filtered_bookings = filtered_bookings.filter(venue_id=venue_id)

    if status is not None:
        filtered_bookings = filtered_bookings.filter(status=status)

    return filtered_bookings.select_related("booker", "venue")


def get_valid_new_date_time_intervals(
    venue: Venue, new_date_time_intervals: Iterable[DateTimeInterval]
) -> Sequence[DateTimeInterval]:
    min_start_date_time = min(new_date_time_intervals).start
    max_end_date_time = max(new_date_time_intervals).end

    existing_bookings_within_range = (
        get_bookings(venue=venue, status=BookingStatus.APPROVED)
        .exclude(end_date_time__lte=min_start_date_time)
        .exclude(start_date_time__gte=max_end_date_time)
    )

    existing_date_time_intervals = (
        DateTimeInterval(booking.start_date_time, booking.end_date_time, False)
        for booking in existing_bookings_within_range
    )

    date_time_intervals = set(existing_date_time_intervals) | set(
        new_date_time_intervals
    )

    valid_date_time_intervals = get_non_overlapping_date_time_intervals(
        date_time_intervals
    )

    valid_new_date_time_intervals = [
        date_time_interval
        for date_time_interval in valid_date_time_intervals
        if date_time_interval.is_new
    ]

    return valid_new_date_time_intervals


def create_bookings(
    title: str,
    booker: User,
    venue: Venue,
    new_date_time_intervals: Iterable[DateTimeInterval],
    form_response_data: list[dict],
) -> Sequence[Booking]:
    if not new_date_time_intervals:
        return []

    valid_new_date_time_intervals = get_valid_new_date_time_intervals(
        venue=venue, new_date_time_intervals=new_date_time_intervals
    )
    bookings_to_be_created = (
        Booking(
            title=title,
            booker=booker,
            venue=venue,
            start_date_time=date_time_interval.start,
            end_date_time=date_time_interval.end,
            form_response_data=form_response_data,
        )
        for date_time_interval in valid_new_date_time_intervals
    )

    new_bookings = Booking.objects.bulk_create(bookings_to_be_created)

    return new_bookings


def update_booking_status(
    booking: Booking, action: BookingStatusAction, user: User
) -> tuple[Sequence[Booking], dict[int, BookingStatus]]:
    current_booking_status = booking.status

    ## cannot update status for cancelled booking
    if current_booking_status == BookingStatus.CANCELLED:
        raise BadRequest(
            detail="Cannot update status of cancelled booking.",
            code="no_update_cancelled_booking",
        )

    ## 1. cannot update to other statuses if user is not admin
    ## 2. cannot cancel booking if user is not booker
    if (user.role != Role.ADMIN and action != BookingStatusAction.CANCEL) or (
        booking.booker != user and action == BookingStatusAction.CANCEL
    ):
        raise PermissionDenied(
            detail=f"No permission to {action.lower()} booking.",
            code="no_update_booking_permission",
        )

    if action == BookingStatusAction.CANCEL:
        booking.status = BookingStatus.CANCELLED
    elif (
        action == BookingStatusAction.APPROVE
        and current_booking_status != BookingStatus.APPROVED
    ):
        booking.status = BookingStatus.APPROVED
    elif (
        action == BookingStatusAction.REVOKE
        and current_booking_status != BookingStatus.PENDING
    ):
        booking.status = BookingStatus.PENDING

    elif (
        action == BookingStatusAction.REJECT
        and current_booking_status != BookingStatus.REJECTED
    ):
        booking.status = BookingStatus.REJECTED
    else:
        raise BadRequest(
            detail=f"The booking has already been {current_booking_status.lower()}.",
            code="same_status_booking_update",
        )

    ## immediately update if new status is not APPROVED
    if booking.status != BookingStatus.APPROVED:
        booking.save(update_fields=["status"])

        return [booking], {booking.id: current_booking_status}

    ## do not update if there are clashing APPROVED bookings
    if (
        get_bookings(status=BookingStatus.APPROVED, venue=booking.venue)
        .exclude(end_date_time__lte=booking.start_date_time)
        .exclude(start_date_time__gte=booking.end_date_time)
        .exclude(id=booking.id)
        .exists()
    ):
        raise BadRequest(
            detail="Cannot approve booking due to other existing clashing approved bookings.",
            code="clashing_approved_bookings",
        )

    clashing_pending_bookings = (
        get_bookings(status=BookingStatus.PENDING, venue=booking.venue)
        .exclude(end_date_time__lte=booking.start_date_time)
        .exclude(start_date_time__gte=booking.end_date_time)
        .exclude(id=booking.id)
    )

    id_to_previous_booking_status_mapping = {
        pending_booking.id: BookingStatus.PENDING
        for pending_booking in clashing_pending_bookings
    }

    id_to_previous_booking_status_mapping[booking.id] = current_booking_status

    with transaction.atomic():
        ## reject clashing pending bookings
        clashing_pending_bookings.update(status=BookingStatus.REJECTED)

        ## update current booking to APPROVED
        booking.save(update_fields=["status"])

        updated_bookings = [
            booking
            for booking in get_bookings(
                id__in=id_to_previous_booking_status_mapping
            ).select_related("booker__organization", "venue")
        ]

    return updated_bookings, id_to_previous_booking_status_mapping


def delete_bookings(
    booking_ids_to_be_deleted: Iterable[int], organization: Organization
) -> Sequence[Booking]:
    bookings_to_be_deleted = get_bookings(
        venue__organization=organization, id__in=booking_ids_to_be_deleted
    ).select_related("booker", "venue")

    deleted_bookings = [booking for booking in bookings_to_be_deleted]

    bookings_to_be_deleted.delete()

    return deleted_bookings
