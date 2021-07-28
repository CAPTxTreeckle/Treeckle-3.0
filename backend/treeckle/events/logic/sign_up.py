from typing import Iterable, Sequence

from django.db import IntegrityError
from django.db.models import QuerySet

from treeckle.common.constants import (
    ID,
    CREATED_AT,
    UPDATED_AT,
    USER,
    EVENT_ID,
    STATUS,
)
from treeckle.common.parsers import parse_datetime_to_ms_timestamp
from organizations.models import Organization
from users.models import User
from users.logic import user_to_json, get_users
from events.models import Event, EventSignUp, SignUpStatus, SignUpAction


def event_sign_up_to_json(event_sign_up: EventSignUp) -> dict:
    return {
        ID: event_sign_up.id,
        CREATED_AT: parse_datetime_to_ms_timestamp(event_sign_up.created_at),
        UPDATED_AT: parse_datetime_to_ms_timestamp(event_sign_up.updated_at),
        USER: user_to_json(event_sign_up.user),
        EVENT_ID: event_sign_up.event_id,
        STATUS: event_sign_up.status,
    }


def get_event_sign_ups(*args, **kwargs) -> QuerySet[EventSignUp]:
    return EventSignUp.objects.filter(*args, **kwargs)


def get_or_create_event_sign_up(
    event: Event, user: User, status: SignUpStatus
) -> EventSignUp:
    event_sign_up, _ = EventSignUp.objects.get_or_create(
        event=event, user=user, status=status
    )
    return event_sign_up


def create_event_sign_up(event: Event, user: User) -> EventSignUp:
    if not event.is_sign_up_allowed:
        raise Exception("Event cannot be signed up.")

    status = (
        SignUpStatus.PENDING
        if event.is_sign_up_approval_required
        else SignUpStatus.CONFIRMED
    )
    try:
        event_sign_up = get_or_create_event_sign_up(
            event=event, user=user, status=status
        )
    except IntegrityError as e:
        event_sign_up = (
            get_event_sign_ups(event=event, user=user)
            .select_related("user__organization", "user__profile_image", "event")
            .get()
        )

    return event_sign_up


def attend_event_sign_up(event: Event, user: User) -> EventSignUp:
    try:
        event_sign_up = (
            get_event_sign_ups(event=event, user=user)
            .select_related("user__organization", "user__profile_image", "event")
            .get()
        )
    except EventSignUp.DoesNotExist as e:
        raise Exception("Event is not signed up.")

    if event_sign_up.status == SignUpStatus.PENDING:
        raise Exception("Cannot attend an event where sign up is not confirmed.")

    if event_sign_up.status == SignUpStatus.ATTENDED:
        raise Exception("You have already attended the event.")

    event_sign_up.status = SignUpStatus.ATTENDED
    event_sign_up.save()
    return event_sign_up


def confirm_event_sign_up(event: Event, user: User) -> EventSignUp:
    try:
        event_sign_up = (
            get_event_sign_ups(event=event, user=user)
            .select_related("user__organization", "user__profile_image", "event")
            .get()
        )
    except EventSignUp.DoesNotExist as e:
        raise Exception("Event is not signed up")

    if event_sign_up.status != SignUpStatus.PENDING:
        raise Exception("No approval required.")

    event_sign_up.status = SignUpStatus.CONFIRMED
    event_sign_up.save()
    return event_sign_up


def delete_event_sign_up(event: Event, user: User) -> None:
    get_event_sign_ups(event=event, user=user).delete()


def update_event_sign_ups(
    actions: Iterable[dict], event: Event, organization: Organization
) -> Sequence[EventSignUp]:
    same_organization_users = get_users(organization=organization)

    updated_event_sign_ups = []
    associated_updated_event_sign_ups_user_ids = set()

    for data in actions:
        action = data.get("action")
        user_id = data.get("user_id")

        ## prevents multiple actions on same user
        if user_id in associated_updated_event_sign_ups_user_ids:
            continue

        user = same_organization_users.get(id=user_id)

        if action == SignUpAction.ATTEND:
            updated_event_sign_up = attend_event_sign_up(event=event, user=user)
        elif action == SignUpAction.CONFIRM:
            updated_event_sign_up = confirm_event_sign_up(event=event, user=user)
        elif action == SignUpAction.REJECT:
            delete_event_sign_up(event=event, user=user)
            continue
        else:
            continue

        updated_event_sign_ups.append(updated_event_sign_up)
        associated_updated_event_sign_ups_user_ids.add(user_id)

    return updated_event_sign_ups
