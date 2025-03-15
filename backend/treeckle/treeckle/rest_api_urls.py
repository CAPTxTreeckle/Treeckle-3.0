from django.urls import include, path


urlpatterns = [
    path("gateway/", include("authentication.urls")),
    path("users/", include("users.urls")),
    path("events/", include("events.urls")),
    path("venues/", include("venues.urls")),
    path("bookings/", include("bookings.urls")),
    path("comments/", include("comments.urls")),
    path('api/nusmods/', include('nusmods.urls')),
]
