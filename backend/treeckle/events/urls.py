from django.urls import path

from .views.event import (
    EventsView,
    EventCategoryTypesView,
    OwnEventsView,
    SignedUpEventsView,
    PublishedEventsView,
    SingleEventView,
)
from .views.subscription import (
    SubscribedEventsView,
    OwnEventCategoryTypeSubscriptionsView,
)
from .views.sign_up import SelfSignUpView, SignUpView

urlpatterns = [
    path("", EventsView.as_view(), name="events"),
    path("categories", EventCategoryTypesView.as_view(), name="event_categories"),
    path(
        "categories/subscriptions",
        OwnEventCategoryTypeSubscriptionsView.as_view(),
        name="own_event_category_subscriptions",
    ),
    path("own", OwnEventsView.as_view(), name="own_events"),
    path("signedup", SignedUpEventsView.as_view(), name="signed_up_events"),
    path("published", PublishedEventsView.as_view(), name="published_events"),
    path("subscribed", SubscribedEventsView.as_view(), name="subscribed_events"),
    path("<int:event_id>", SingleEventView.as_view(), name="single_event"),
    path("<int:event_id>/selfsignup", SelfSignUpView.as_view(), name="self_sign_up"),
    path("<int:event_id>/signup", SignUpView.as_view(), name="sign_up"),
]
