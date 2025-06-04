from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter

from users.permission_middlewares import check_access
from users.models import Role, User
from events.middlewares import (
    check_requester_event_same_organization,
    check_event_modifier,
)
from events.logic.sign_up import (
    event_sign_up_to_json,
    create_event_sign_up,
    delete_event_sign_up,
    update_event_sign_ups,
    attend_event_sign_up,
)
from events.models import Event
from events.serializers import PatchEventSignUpSerializer


@extend_schema_view(
    post=extend_schema(
        summary="Sign Up for Event",
        description="Sign up the current user for a specific event. The user must be from the same organization as the event.",
        parameters=[
            OpenApiParameter(
                name="event_id",
                description="Unique identifier of the event to sign up for",
                required=True,
                type=int,
                location=OpenApiParameter.PATH,
            )
        ],
        responses={
            201: {
                "description": "Successfully signed up for the event",
                "example": {
                    "id": 67,
                    "user": {
                        "id": 15,
                        "name": "John Participant",
                        "email": "john@university.edu",
                        "profile_image_url": "https://example.com/john.jpg",
                    },
                    "status": "PENDING",
                    "created_at": 1735689600000,
                },
            },
            400: {"description": "Already signed up for this event or event is full"},
            401: {"description": "Authentication required"},
            403: {"description": "Not authorized to sign up for this event"},
            404: {"description": "Event not found"},
        },
        tags=["Event Sign-ups"],
    ),
    patch=extend_schema(
        summary="Mark Event Attendance",
        description="Mark the current user's attendance for an event they are signed up for. Updates sign-up status to 'ATTENDED'.",
        parameters=[
            OpenApiParameter(
                name="event_id",
                description="Unique identifier of the event to mark attendance for",
                required=True,
                type=int,
                location=OpenApiParameter.PATH,
            )
        ],
        responses={
            200: {
                "description": "Attendance marked successfully",
                "example": {
                    "id": 67,
                    "user": {
                        "id": 15,
                        "name": "John Participant",
                        "email": "john@university.edu",
                        "profile_image_url": "https://example.com/john.jpg",
                    },
                    "status": "ATTENDED",
                    "created_at": 1735689600000,
                },
            },
            400: {"description": "Not signed up for this event or invalid status transition"},
            401: {"description": "Authentication required"},
            403: {"description": "Not authorized to mark attendance for this event"},
            404: {"description": "Event not found"},
        },
        tags=["Event Sign-ups"],
    ),
    delete=extend_schema(
        summary="Cancel Event Sign-up",
        description="Cancel the current user's sign-up for a specific event. Removes the sign-up record completely.",
        parameters=[
            OpenApiParameter(
                name="event_id",
                description="Unique identifier of the event to cancel sign-up for",
                required=True,
                type=int,
                location=OpenApiParameter.PATH,
            )
        ],
        responses={
            204: {"description": "Sign-up cancelled successfully"},
            400: {"description": "Not signed up for this event"},
            401: {"description": "Authentication required"},
            403: {"description": "Not authorized to cancel sign-up for this event"},
            404: {"description": "Event not found"},
        },
        tags=["Event Sign-ups"],
    ),
)
class SelfSignUpView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_requester_event_same_organization
    def post(self, request, requester: User, event: Event):
        """
        Sign up the current user for an event.

        Creates a new sign-up record for the current user and the specified event.
        The sign-up status will be 'PENDING' initially, and may require approval
        depending on the event settings.
        """
        new_event_sign_up = create_event_sign_up(event=event, user=requester)

        data = event_sign_up_to_json(new_event_sign_up)

        return Response(data, status=status.HTTP_201_CREATED)

    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_requester_event_same_organization
    def patch(self, request, requester: User, event: Event):
        """
        Mark attendance for the current user's event sign-up.

        Updates the sign-up status to 'ATTENDED' for the current user.
        The user must already be signed up for the event.
        """
        attended_event_sign_up = attend_event_sign_up(event=event, user=requester)

        data = event_sign_up_to_json(attended_event_sign_up)

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_requester_event_same_organization
    def delete(self, request, requester: User, event: Event):
        """
        Cancel the current user's sign-up for an event.

        Completely removes the sign-up record for the current user and the specified event.
        This action cannot be undone, and the user would need to sign up again if desired.
        """
        delete_event_sign_up(event=event, user=requester)

        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema_view(
    patch=extend_schema(
        summary="Manage Event Sign-ups",
        description="Batch update sign-up statuses for an event. Only event organizers and admins can manage sign-ups. Supports confirming, rejecting, or marking attendance for multiple users.",
        parameters=[
            OpenApiParameter(
                name="event_id",
                description="Unique identifier of the event to manage sign-ups for",
                required=True,
                type=int,
                location=OpenApiParameter.PATH,
            )
        ],
        request=PatchEventSignUpSerializer,
        responses={
            200: {
                "description": "Sign-ups updated successfully",
                "example": [
                    {
                        "id": 23,
                        "user": {
                            "id": 45,
                            "name": "Alice Student",
                            "email": "alice@university.edu",
                            "profile_image_url": "https://example.com/alice.jpg",
                        },
                        "status": "CONFIRMED",
                        "created_at": 1735689600000,
                    },
                    {
                        "id": 24,
                        "user": {
                            "id": 46,
                            "name": "Bob Student",
                            "email": "bob@university.edu",
                            "profile_image_url": "https://example.com/bob.jpg",
                        },
                        "status": "ATTENDED",
                        "created_at": 1735693200000,
                    },
                ],
            },
            400: {
                "description": "Invalid action or user not found",
                "example": {
                    "actions": ["Invalid action or user not found for some entries"]
                },
            },
            401: {"description": "Authentication required"},
            403: {"description": "Not authorized to manage sign-ups for this event"},
            404: {"description": "Event not found"},
        },
        tags=["Event Sign-ups"],
    )
)
class SignUpView(APIView):
    @check_access(Role.ORGANIZER, Role.ADMIN)
    @check_requester_event_same_organization
    @check_event_modifier
    def patch(self, request, requester: User, event: Event):
        """
        Batch update event sign-up statuses.

        Allows event organizers and admins to perform bulk actions on event sign-ups,
        such as confirming pending sign-ups, rejecting applications, or marking attendance.
        Each action specifies a user ID and the desired action (CONFIRM, REJECT, ATTEND).
        """
        serializer = PatchEventSignUpSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        actions = serializer.validated_data.get("actions", [])

        updated_event_sign_ups = update_event_sign_ups(
            actions=actions, event=event, organization=requester.organization
        )

        data = [
            event_sign_up_to_json(event_sign_up)
            for event_sign_up in updated_event_sign_ups
        ]

        return Response(data, status=status.HTTP_200_OK)
