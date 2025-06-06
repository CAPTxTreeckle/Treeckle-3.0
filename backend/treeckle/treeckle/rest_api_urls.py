from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"
    ),
    path("redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path("gateway/", include("authentication.urls")),
    path("users/", include("users.urls")),
    path("events/", include("events.urls")),
    path("venues/", include("venues.urls")),
    path("bookings/", include("bookings.urls")),
    path("comments/", include("comments.urls")),
    path("api/nusmods/", include("nusmods.urls")),
]
