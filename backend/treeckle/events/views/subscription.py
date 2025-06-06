from django.db.models import Prefetch

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, extend_schema_view

from treeckle.common.constants import SUBSCRIBED_CATEGORIES, NON_SUBSCRIBED_CATEGORIES
from users.permission_middlewares import check_access
from users.models import Role, User
from events.models import EventCategory
from events.serializers import PatchEventCategoryTypeSubscriptionSerializer
from events.logic.event import (
    get_event_categories,
    get_events,
    event_to_json,
)
from events.logic.subscription import (
    get_event_category_type_subscriptions,
    get_user_event_category_subscription_info,
    update_user_event_category_subscriptions,
)


@extend_schema_view(
    get=extend_schema(
        summary="Get Event Category Subscriptions",
        description="Retrieve the current user's event category subscriptions. Shows which categories the user is subscribed to and which are available for subscription.",
        responses={
            200: {
                "description": "User's event category subscription information",
                "example": {
                    "subscribed_categories": ["Sports", "Academic", "Workshop"],
                    "non_subscribed_categories": [
                        "Social",
                        "Arts",
                        "Community Service",
                    ],
                },
            },
            401: {"description": "Authentication required"},
        },
        tags=["Event Subscriptions"],
    ),
    patch=extend_schema(
        summary="Update Event Category Subscriptions",
        description="Update the current user's event category subscriptions. Allows subscribing to or unsubscribing from multiple categories in a single request.",
        request=PatchEventCategoryTypeSubscriptionSerializer,
        responses={
            200: {
                "description": "Subscriptions updated successfully",
                "example": {
                    "subscribed_categories": ["Sports", "Academic", "Workshop", "Arts"],
                    "non_subscribed_categories": ["Social", "Community Service"],
                },
            },
            400: {
                "description": "Invalid subscription data",
                "example": {"actions": ["Invalid action or category not found"]},
            },
            401: {"description": "Authentication required"},
        },
        tags=["Event Subscriptions"],
    ),
)
class OwnEventCategoryTypeSubscriptionsView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def get(self, request, requester: User):
        """
        Get the current user's event category subscriptions.

        Returns two lists: categories the user is subscribed to and categories
        available for subscription within their organization.
        """
        (
            subscribed_categories,
            non_subscribed_categories,
        ) = get_user_event_category_subscription_info(user=requester)

        data = {
            SUBSCRIBED_CATEGORIES: subscribed_categories,
            NON_SUBSCRIBED_CATEGORIES: non_subscribed_categories,
        }

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def patch(self, request, requester: User):
        """
        Update the current user's event category subscriptions.

        Processes a list of subscription actions, allowing the user to subscribe
        to new categories or unsubscribe from existing ones. Each action specifies
        a category name and the desired action (SUBSCRIBE or UNSUBSCRIBE).
        """
        serializer = PatchEventCategoryTypeSubscriptionSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        actions = serializer.validated_data.get("actions", [])

        update_user_event_category_subscriptions(actions=actions, user=requester)

        (
            subscribed_categories,
            non_subscribed_categories,
        ) = get_user_event_category_subscription_info(user=requester)

        data = {
            SUBSCRIBED_CATEGORIES: subscribed_categories,
            NON_SUBSCRIBED_CATEGORIES: non_subscribed_categories,
        }

        return Response(data, status=status.HTTP_200_OK)


@extend_schema_view(
    get=extend_schema(
        summary="Get Subscribed Events",
        description="Retrieve all published events that match the current user's category subscriptions. Shows events from categories the user has subscribed to receive notifications about.",
        responses={
            200: {
                "description": "List of events from subscribed categories",
                "example": [
                    {
                        "id": 15,
                        "title": "Weekly Basketball Tournament",
                        "creator": {
                            "id": 12,
                            "name": "Sports Coordinator",
                            "profile_image_url": "https://example.com/coordinator.jpg",
                        },
                        "organized_by": "Sports Club",
                        "venue_name": "Basketball Court",
                        "description": "Weekly basketball tournament for all skill levels.",
                        "capacity": 32,
                        "start_date_time": 1736121600000,
                        "end_date_time": 1736128800000,
                        "image_url": "https://example.com/basketball.jpg",
                        "is_published": True,
                        "is_sign_up_allowed": True,
                        "is_sign_up_approval_required": False,
                        "categories": ["Sports"],
                        "sign_up_count": 24,
                        "can_modify": False,
                        "can_view_sign_ups": False,
                    },
                    {
                        "id": 16,
                        "title": "Advanced Programming Workshop",
                        "creator": {
                            "id": 8,
                            "name": "CS Professor",
                            "profile_image_url": "https://example.com/professor.jpg",
                        },
                        "organized_by": "Computer Science Department",
                        "venue_name": "Lab 101",
                        "description": "Deep dive into advanced programming concepts and techniques.",
                        "capacity": 25,
                        "start_date_time": 1736208000000,
                        "end_date_time": 1736218800000,
                        "image_url": "https://example.com/programming.jpg",
                        "is_published": True,
                        "is_sign_up_allowed": True,
                        "is_sign_up_approval_required": True,
                        "categories": ["Academic", "Workshop"],
                        "sign_up_count": 18,
                        "can_modify": False,
                        "can_view_sign_ups": False,
                    },
                ],
            },
            401: {"description": "Authentication required"},
        },
        tags=["Event Subscriptions"],
    )
)
class SubscribedEventsView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def get(self, request, requester: User):
        """
        Get all published events from subscribed categories.

        Returns events that are published and belong to categories the user
        has subscribed to. This helps users discover relevant events based
        on their interests without having to browse all available events.
        """
        user_subscriptions = get_event_category_type_subscriptions(
            user=requester
        ).select_related("category")

        subscribed_category_types = [
            subscription.category for subscription in user_subscriptions
        ]

        subscribed_published_event_ids = (
            get_event_categories(
                category__in=subscribed_category_types, event__is_published=True
            )
            .values_list("event_id", flat=True)
            .distinct()
        )

        subscribed_published_events = (
            get_events(id__in=subscribed_published_event_ids)
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
            event_to_json(event, requester) for event in subscribed_published_events
        ]

        return Response(data, status=status.HTTP_200_OK)
