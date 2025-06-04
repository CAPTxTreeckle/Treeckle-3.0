from django.db.models import Prefetch

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter

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


@extend_schema_view(
    get=extend_schema(
        summary="Get Event Category Types",
        description="Retrieve all available event category types within the user's organization. Accessible by residents, organizers, and admins.",
        responses={
            200: {
                "description": "List of event category types",
                "example": [
                    "Sports",
                    "Academic",
                    "Social",
                    "Workshop"
                ]
            },
            401: {"description": "Authentication required"},
            403: {"description": "Insufficient permissions"}
        },
        tags=["Events"]
    )
)
class EventCategoryTypesView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def get(self, request, requester: User):
        """
        Get all event category types available in the user's organization.
        
        Returns a list of category type names that can be used when creating or filtering events.
        Only includes category types from the same organization as the requesting user.
        """
        same_organization_event_category_types = get_event_category_types(
            organization=requester.organization
        )

        data = [
            event_category_type.name
            for event_category_type in same_organization_event_category_types
        ]

        return Response(data, status=status.HTTP_200_OK)


@extend_schema_view(
    get=extend_schema(
        summary="Get All Events",
        description="Retrieve all events within the organization. Admin-only access. Returns comprehensive event details including sign-ups and categories.",
        responses={
            200: {
                "description": "List of all organization events with complete details",
                "example": [
                    {
                        "id": 1,
                        "title": "Annual Sports Day",
                        "creator": {
                            "id": 2,
                            "name": "John Organizer",
                            "profile_image_url": "https://example.com/image.jpg"
                        },
                        "organized_by": "Sports Committee",
                        "venue_name": "Sports Complex",
                        "description": "Join us for a day of exciting sports activities and competitions.",
                        "capacity": 100,
                        "start_date_time": 1735689600000,
                        "end_date_time": 1735776000000,
                        "image_url": "https://example.com/event-image.jpg",
                        "is_published": True,
                        "is_sign_up_allowed": True,
                        "is_sign_up_approval_required": False,
                        "categories": ["Sports", "Recreation"],
                        "sign_up_count": 45,
                        "can_modify": True,
                        "can_view_sign_ups": True
                    }
                ]
            },
            401: {"description": "Authentication required"},
            403: {"description": "Admin access required"}
        },
        tags=["Events"]
    ),
    post=extend_schema(
        summary="Create New Event",
        description="Create a new event within the organization. Accessible by organizers and admins. Event categories will be automatically created if they don't exist.",
        request=EventSerializer,
        responses={
            201: {
                "description": "Event created successfully",
                "example": {
                    "id": 1,
                    "title": "Workshop on Leadership",
                    "creator": {
                        "id": 3,
                        "name": "Jane Organizer",
                        "profile_image_url": "https://example.com/jane.jpg"
                    },
                    "organized_by": "HR Department",
                    "venue_name": "Conference Room A",
                    "description": "Interactive leadership workshop for all members.",
                    "capacity": 50,
                    "start_date_time": 1735689600000,
                    "end_date_time": 1735693200000,
                    "image_url": "",
                    "is_published": False,
                    "is_sign_up_allowed": True,
                    "is_sign_up_approval_required": True,
                    "categories": ["Workshop", "Professional Development"],
                    "sign_up_count": 0,
                    "can_modify": True,
                    "can_view_sign_ups": True
                }
            },
            400: {
                "description": "Invalid input data",
                "example": {
                    "end_date_time": ["Event end date/time cannot be before start date/time"]
                }
            },
            401: {"description": "Authentication required"},
            403: {"description": "Organizer or admin access required"}
        },
        tags=["Events"]
    )
)
class EventsView(APIView):
    @check_access(Role.ADMIN)
    def get(self, request, requester: User):
        """
        Get all events within the organization.
        
        Admin-only endpoint that returns comprehensive details about all events
        in the organization, including sign-up counts, categories, and permissions.
        """
        same_organization_events = (
            get_events(creator__organization=requester.organization)
            .prefetch_related(
                "eventsignup_set",
                Prefetch(
                    "eventcategory_set",
                    queryset=EventCategory.objects.select_related("category"),
                ),
            )
            .select_related("creator__organization", "creator__profile_image")
        )

        data = [event_to_json(event, requester) for event in same_organization_events]

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ORGANIZER, Role.ADMIN)
    def post(self, request, requester: User):
        """
        Create a new event.
        
        Creates a new event with the provided details. Event categories specified
        in the request will be automatically created if they don't exist in the organization.
        Only organizers and admins can create events.
        """
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


@extend_schema_view(
    get=extend_schema(
        summary="Get Own Created Events",
        description="Retrieve all events created by the current user. Accessible by organizers and admins only.",
        responses={
            200: {
                "description": "List of events created by the current user",
                "example": [
                    {
                        "id": 2,
                        "title": "Team Building Workshop",
                        "creator": {
                            "id": 3,
                            "name": "Current User",
                            "profile_image_url": "https://example.com/user.jpg"
                        },
                        "organized_by": "Management Team",
                        "venue_name": "Meeting Room B",
                        "description": "Interactive team building activities and exercises.",
                        "capacity": 30,
                        "start_date_time": 1735776000000,
                        "end_date_time": 1735779600000,
                        "image_url": "https://example.com/workshop.jpg",
                        "is_published": True,
                        "is_sign_up_allowed": True,
                        "is_sign_up_approval_required": False,
                        "categories": ["Workshop", "Team Building"],
                        "sign_up_count": 18,
                        "can_modify": True,
                        "can_view_sign_ups": True
                    }
                ]
            },
            401: {"description": "Authentication required"},
            403: {"description": "Organizer or admin access required"}
        },
        tags=["Events"]
    )
)
class OwnEventsView(APIView):
    @check_access(Role.ORGANIZER, Role.ADMIN)
    def get(self, request, requester: User):
        """
        Get all events created by the current user.
        
        Returns events where the current user is the creator, along with
        complete event details including sign-up information and categories.
        """
        same_creator_events = (
            get_events(creator=requester)
            .prefetch_related(
                "eventsignup_set",
                Prefetch(
                    "eventcategory_set",
                    queryset=EventCategory.objects.select_related("category"),
                ),
            )
            .select_related("creator__organization", "creator__profile_image")
        )

        data = [event_to_json(event, requester) for event in same_creator_events]

        return Response(data, status=status.HTTP_200_OK)


@extend_schema_view(
    get=extend_schema(
        summary="Get Signed Up Events",
        description="Retrieve all published events that the current user has signed up for. Accessible by all authenticated users.",
        responses={
            200: {
                "description": "List of events the current user has signed up for",
                "example": [
                    {
                        "id": 5,
                        "title": "Photography Workshop",
                        "creator": {
                            "id": 7,
                            "name": "Photo Club Admin",
                            "profile_image_url": "https://example.com/admin.jpg"
                        },
                        "organized_by": "Photography Club",
                        "venue_name": "Art Studio",
                        "description": "Learn basic photography techniques and composition.",
                        "capacity": 20,
                        "start_date_time": 1735862400000,
                        "end_date_time": 1735866000000,
                        "image_url": "https://example.com/photo-workshop.jpg",
                        "is_published": True,
                        "is_sign_up_allowed": True,
                        "is_sign_up_approval_required": True,
                        "categories": ["Photography", "Arts"],
                        "sign_up_count": 15,
                        "can_modify": False,
                        "can_view_sign_ups": False
                    }
                ]
            },
            401: {"description": "Authentication required"}
        },
        tags=["Events"]
    )
)
class SignedUpEventsView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def get(self, request, requester: User):
        """
        Get all published events the current user has signed up for.
        
        Returns only published events where the user has an active sign-up,
        regardless of the sign-up status (pending, confirmed, or attended).
        """
        user_published_event_sign_ups = get_event_sign_ups(
            user=requester, event__is_published=True
        ).select_related("event")
        signed_up_events = [
            event_sign_up.event for event_sign_up in user_published_event_sign_ups
        ]

        data = [event_to_json(event, requester) for event in signed_up_events]

        return Response(data, status=status.HTTP_200_OK)


@extend_schema_view(
    get=extend_schema(
        summary="Get Published Events",
        description="Retrieve all published events within the organization. Shows events that are publicly available to all users.",
        responses={
            200: {
                "description": "List of all published events in the organization",
                "example": [
                    {
                        "id": 8,
                        "title": "Community Cleanup Drive",
                        "creator": {
                            "id": 4,
                            "name": "Community Leader",
                            "profile_image_url": "https://example.com/leader.jpg"
                        },
                        "organized_by": "Green Initiative Committee",
                        "venue_name": "Campus Grounds",
                        "description": "Join us in keeping our community clean and green.",
                        "capacity": 200,
                        "start_date_time": 1735948800000,
                        "end_date_time": 1735959600000,
                        "image_url": "https://example.com/cleanup.jpg",
                        "is_published": True,
                        "is_sign_up_allowed": True,
                        "is_sign_up_approval_required": False,
                        "categories": ["Community Service", "Environment"],
                        "sign_up_count": 87,
                        "can_modify": False,
                        "can_view_sign_ups": False
                    }
                ]
            },
            401: {"description": "Authentication required"}
        },
        tags=["Events"]
    )
)
class PublishedEventsView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def get(self, request, requester: User):
        """
        Get all published events in the organization.
        
        Returns events that have been marked as published and are visible
        to all organization members. Includes complete event details and
        current sign-up counts.
        """
        same_organization_published_events = (
            get_events(creator__organization=requester.organization, is_published=True)
            .prefetch_related(
                "eventsignup_set",
                Prefetch(
                    "eventcategory_set",
                    queryset=EventCategory.objects.select_related("category"),
                ),
            )
            .select_related("creator__organization", "creator__profile_image")
        )

        data = [
            event_to_json(event, requester)
            for event in same_organization_published_events
        ]

        return Response(data, status=status.HTTP_200_OK)


@extend_schema_view(
    get=extend_schema(
        summary="Get Single Event Details",
        description="Retrieve detailed information about a specific event, including all sign-ups. Access controlled by organization membership and event visibility permissions.",
        parameters=[
            OpenApiParameter(
                name="event_id",
                description="Unique identifier of the event",
                required=True,
                type=int,
                location=OpenApiParameter.PATH
            )
        ],
        responses={
            200: {
                "description": "Detailed event information with sign-ups",
                "example": {
                    "event": {
                        "id": 12,
                        "title": "Annual Conference 2025",
                        "creator": {
                            "id": 8,
                            "name": "Conference Organizer",
                            "profile_image_url": "https://example.com/organizer.jpg"
                        },
                        "organized_by": "Academic Committee",
                        "venue_name": "Main Auditorium",
                        "description": "Annual academic conference with keynote speakers and workshops.",
                        "capacity": 300,
                        "start_date_time": 1736035200000,
                        "end_date_time": 1736049600000,
                        "image_url": "https://example.com/conference.jpg",
                        "is_published": True,
                        "is_sign_up_allowed": True,
                        "is_sign_up_approval_required": True,
                        "categories": ["Academic", "Conference"],
                        "sign_up_count": 156,
                        "can_modify": False,
                        "can_view_sign_ups": True
                    },
                    "sign_ups": [
                        {
                            "id": 45,
                            "user": {
                                "id": 23,
                                "name": "Jane Participant",
                                "email": "jane@university.edu",
                                "profile_image_url": "https://example.com/jane-participant.jpg"
                            },
                            "status": "CONFIRMED",
                            "created_at": 1735689600000
                        }
                    ]
                }
            },
            401: {"description": "Authentication required"},
            403: {"description": "Not authorized to view this event"},
            404: {"description": "Event not found"}
        },
        tags=["Events"]
    ),
    put=extend_schema(
        summary="Update Event",
        description="Update an existing event. Only event creators, organizers, and admins from the same organization can modify events.",
        parameters=[
            OpenApiParameter(
                name="event_id",
                description="Unique identifier of the event to update",
                required=True,
                type=int,
                location=OpenApiParameter.PATH
            )
        ],
        request=EventSerializer,
        responses={
            200: {
                "description": "Event updated successfully",
                "example": {
                    "id": 12,
                    "title": "Updated Conference Title",
                    "creator": {
                        "id": 8,
                        "name": "Conference Organizer",
                        "profile_image_url": "https://example.com/organizer.jpg"
                    },
                    "organized_by": "Academic Committee",
                    "venue_name": "Updated Venue",
                    "description": "Updated conference description with new details.",
                    "capacity": 250,
                    "start_date_time": 1736035200000,
                    "end_date_time": 1736049600000,
                    "image_url": "https://example.com/updated-image.jpg",
                    "is_published": True,
                    "is_sign_up_allowed": True,
                    "is_sign_up_approval_required": True,
                    "categories": ["Academic", "Conference", "Updated"],
                    "sign_up_count": 156,
                    "can_modify": True,
                    "can_view_sign_ups": True
                }
            },
            400: {
                "description": "Invalid input data",
                "example": {
                    "end_date_time": ["Event end date/time cannot be before start date/time"]
                }
            },
            401: {"description": "Authentication required"},
            403: {"description": "Not authorized to modify this event"},
            404: {"description": "Event not found"}
        },
        tags=["Events"]
    ),
    delete=extend_schema(
        summary="Delete Event",
        description="Delete an existing event. Only event creators, organizers, and admins from the same organization can delete events. Unused event category types will be automatically cleaned up.",
        parameters=[
            OpenApiParameter(
                name="event_id",
                description="Unique identifier of the event to delete",
                required=True,
                type=int,
                location=OpenApiParameter.PATH
            )
        ],
        responses={
            204: {"description": "Event deleted successfully"},
            401: {"description": "Authentication required"},
            403: {"description": "Not authorized to delete this event"},
            404: {"description": "Event not found"}
        },
        tags=["Events"]
    )
)
class SingleEventView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_requester_event_same_organization
    @check_event_viewer
    def get(self, request, requester: User, event: Event):
        """
        Get detailed information about a specific event.
        
        Returns comprehensive event details along with all sign-ups if the user
        has permission to view them. Access is controlled by organization membership
        and event visibility settings.
        """
        sign_ups = get_event_sign_ups(event=event).select_related(
            "user__organization", "user__profile_image"
        )

        data = {
            EVENT: event_to_json(event, requester),
            SIGN_UPS: [event_sign_up_to_json(sign_up) for sign_up in sign_ups],
        }

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ORGANIZER, Role.ADMIN)
    @check_requester_event_same_organization
    @check_event_modifier
    def put(self, request, requester: User, event: Event):
        """
        Update an existing event.
        
        Updates event details with the provided data. Only users with modification
        permissions (event creator, organizers, admins) can update events.
        Event categories will be updated accordingly.
        """
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
        """
        Delete an existing event.
        
        Permanently removes the event and all associated data. Also cleans up
        any unused event category types within the organization. Only users
        with modification permissions can delete events.
        """
        event.delete()
        delete_unused_event_category_types(organization=requester.organization)

        return Response(status=status.HTTP_204_NO_CONTENT)
