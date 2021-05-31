from typing import Iterable

from django.db.models import QuerySet
from django.db import IntegrityError

from users.models import User
from events.models import (
    EventCategoryTypeSubscription,
    SubscriptionActionType,
    EventCategoryType,
)
from events.logic.event import get_event_category_types


def get_event_category_type_subscriptions(
    *args,
    **kwargs,
) -> QuerySet[EventCategoryTypeSubscription]:
    return EventCategoryTypeSubscription.objects.filter(*args, **kwargs)


def get_user_event_category_subscription_info(
    user: User,
) -> tuple[list[str], list[str]]:
    user_subscriptions = get_event_category_type_subscriptions(
        user=user
    ).select_related("category")
    subscribed_categories = [
        subscription.category.name for subscription in user_subscriptions
    ]

    non_subscribed_event_category_types = get_event_category_types(
        organization=user.organization
    ).exclude(name__in=subscribed_categories)
    non_subscribed_categories = [
        category.name for category in non_subscribed_event_category_types
    ]

    return subscribed_categories, non_subscribed_categories


def update_user_event_category_subscriptions(
    actions: Iterable[dict], user: User
) -> None:
    categories = get_event_category_types(organization=user.organization)
    updated_category_subscriptions = set()

    for data in actions:
        try:
            action = data.get("action")
            category = categories.get(name=data.get("category"))

            ## prevents multiple actions on same category
            if category in updated_category_subscriptions:
                continue

            if action == SubscriptionActionType.SUBSCRIBE:
                EventCategoryTypeSubscription.objects.create(
                    user=user, category=category
                )
            elif action == SubscriptionActionType.UNSUBSCRIBE:
                get_event_category_type_subscriptions(
                    user=user, category=category
                ).delete()
            else:
                continue

            updated_category_subscriptions.add(category)
        except (IntegrityError, EventCategoryType.DoesNotExist) as e:
            continue
