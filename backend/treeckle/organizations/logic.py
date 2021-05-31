from typing import Iterable, Sequence

from django.db.models import QuerySet

from treeckle.common.constants import ID, CREATED_AT, UPDATED_AT, NAME, EMAIL
from treeckle.common.parsers import parse_datetime_to_ms_timestamp
from .models import OrganizationListener, Organization


def organization_listener_to_json(listener: OrganizationListener) -> dict:
    return {
        ID: listener.id,
        CREATED_AT: parse_datetime_to_ms_timestamp(listener.created_at),
        UPDATED_AT: parse_datetime_to_ms_timestamp(listener.updated_at),
        NAME: listener.name,
        EMAIL: listener.email,
    }


def get_organization_listeners(*args, **kwargs) -> QuerySet[OrganizationListener]:
    return OrganizationListener.objects.filter(*args, **kwargs)


def create_organization_listeners(
    listenerData: Iterable[dict], organization: Organization
) -> Sequence[OrganizationListener]:
    existing_same_organization_listeners = set(
        get_organization_listeners(organization=organization).values_list(
            "email", flat=True
        )
    )

    listeners_to_be_created = (
        OrganizationListener(
            organization=organization, name=data["name"], email=data["email"]
        )
        for data in listenerData
        if data["email"] not in existing_same_organization_listeners
    )

    new_listeners = OrganizationListener.objects.bulk_create(listeners_to_be_created)

    return new_listeners


def delete_organization_listeners(
    listener_ids_to_be_deleted: Iterable[int], organization=Organization
) -> Sequence[OrganizationListener]:
    listeners_to_be_deleted = get_organization_listeners(
        organization=organization, id__in=listener_ids_to_be_deleted
    )

    deleted_listeners = [listener for listener in listeners_to_be_deleted]

    listeners_to_be_deleted.delete()

    return deleted_listeners
