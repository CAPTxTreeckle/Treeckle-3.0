from enum import Enum

from django.db.models import Prefetch

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

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


class OwnEventCategoryTypeSubscriptionsView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def get(self, request, requester: User):
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


class SubscribedEventsView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def get(self, request, requester: User):
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
            .select_related("creator")
        )

        data = [
            event_to_json(event, requester) for event in subscribed_published_events
        ]

        return Response(data, status=status.HTTP_200_OK)
