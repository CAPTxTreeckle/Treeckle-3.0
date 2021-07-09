from django.db import IntegrityError
from django.db.models import Prefetch

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from treeckle.common.exceptions import BadRequest
from treeckle.common.parsers import parse_ms_timestamp_to_datetime
from treeckle.common.constants import EVENT, SIGN_UPS
from users.permission_middlewares import check_access
from users.models import Role, User
from events.serializers import EventSerializer
from events.logic.event import (
    get_events,
    event_to_json,
    create_event,
    delete_unused_event_category_types,
    update_event,
    get_event_category_types,
)
from events.logic.sign_up import get_event_sign_ups, event_sign_up_to_json
from events.models import Event, EventCategory
from events.middlewares import (
    check_requester_event_same_organization,
    check_event_viewer,
    check_event_modifier,
)


class EventCategoryTypesView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def get(self, request, requester: User):
        same_organization_event_category_types = get_event_category_types(
            organization=requester.organization
        )

        data = [
            event_category_type.name
            for event_category_type in same_organization_event_category_types
        ]

        return Response(data, status=status.HTTP_200_OK)


class EventsView(APIView):
    @check_access(Role.ADMIN)
    def get(self, request, requester: User):
        same_organization_events = (
            get_events(creator__organization=requester.organization)
            .prefetch_related(
                "eventsignup_set",
                Prefetch(
                    "eventcategory_set",
                    queryset=EventCategory.objects.select_related("category"),
                ),
            )
            .select_related("creator")
        )

        data = [event_to_json(event, requester) for event in same_organization_events]

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ORGANIZER, Role.ADMIN)
    def post(self, request, requester: User):
        serializer = EventSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        new_event = create_event(
            creator=requester,
            title=validated_data.get("title", ""),
            organized_by=validated_data.get("organized_by", ""),
            venue_name=validated_data.get("venue_name", ""),
            description=validated_data.get("description", ""),
            capacity=validated_data.get("capacity", None),
            start_date_time=parse_ms_timestamp_to_datetime(
                validated_data.get("start_date_time", 0)
            ),
            end_date_time=parse_ms_timestamp_to_datetime(
                validated_data.get("end_date_time", 0)
            ),
            image=validated_data.get("image", ""),
            is_published=validated_data.get("is_published", False),
            is_sign_up_allowed=validated_data.get("is_sign_up_allowed", False),
            is_sign_up_approval_required=validated_data.get(
                "is_sign_up_approval_required", False
            ),
            categories=validated_data.get("categories", []),
        )

        data = event_to_json(new_event, requester)

        return Response(data, status=status.HTTP_201_CREATED)


class OwnEventsView(APIView):
    @check_access(Role.ORGANIZER, Role.ADMIN)
    def get(self, request, requester: User):
        same_creator_events = (
            get_events(creator=requester)
            .prefetch_related(
                "eventsignup_set",
                Prefetch(
                    "eventcategory_set",
                    queryset=EventCategory.objects.select_related("category"),
                ),
            )
            .select_related("creator")
        )

        data = [event_to_json(event, requester) for event in same_creator_events]

        return Response(data, status=status.HTTP_200_OK)


class SignedUpEventsView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def get(self, request, requester: User):
        user_published_event_sign_ups = get_event_sign_ups(
            user=requester, event__is_published=True
        ).select_related("event")
        signed_up_events = [
            event_sign_up.event for event_sign_up in user_published_event_sign_ups
        ]

        data = [event_to_json(event, requester) for event in signed_up_events]

        return Response(data, status=status.HTTP_200_OK)


class PublishedEventsView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def get(self, request, requester: User):
        same_organization_published_events = (
            get_events(creator__organization=requester.organization, is_published=True)
            .prefetch_related(
                "eventsignup_set",
                Prefetch(
                    "eventcategory_set",
                    queryset=EventCategory.objects.select_related("category"),
                ),
            )
            .select_related("creator")
        )

        data = [
            event_to_json(event, requester)
            for event in same_organization_published_events
        ]

        return Response(data, status=status.HTTP_200_OK)


class SingleEventView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_requester_event_same_organization
    @check_event_viewer
    def get(self, request, requester: User, event: Event):
        sign_ups = get_event_sign_ups(event=event).select_related("user__organization")

        data = {
            EVENT: event_to_json(event, requester),
            SIGN_UPS: [event_sign_up_to_json(sign_up) for sign_up in sign_ups],
        }

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ORGANIZER, Role.ADMIN)
    @check_requester_event_same_organization
    @check_event_modifier
    def put(self, request, requester: User, event: Event):
        serializer = EventSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        updated_event = update_event(
            current_event=event,
            title=validated_data.get("title", ""),
            organized_by=validated_data.get("organized_by", ""),
            venue_name=validated_data.get("venue_name", ""),
            description=validated_data.get("description", ""),
            capacity=validated_data.get("capacity", None),
            start_date_time=parse_ms_timestamp_to_datetime(
                validated_data.get("start_date_time", 0)
            ),
            end_date_time=parse_ms_timestamp_to_datetime(
                validated_data.get("end_date_time", 0)
            ),
            image=validated_data.get("image", ""),
            is_published=validated_data.get("is_published", False),
            is_sign_up_allowed=validated_data.get("is_sign_up_allowed", False),
            is_sign_up_approval_required=validated_data.get(
                "is_sign_up_approval_required", False
            ),
            categories=validated_data.get("categories", []),
        )

        data = event_to_json(updated_event, requester)

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ORGANIZER, Role.ADMIN)
    @check_requester_event_same_organization
    @check_event_modifier
    def delete(self, request, requester: User, event: Event):
        event.delete()
        delete_unused_event_category_types(organization=requester.organization)

        return Response(status=status.HTTP_204_NO_CONTENT)
