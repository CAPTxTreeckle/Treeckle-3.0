from django.urls import path

from .views import VenueCategoriesView, VenuesView, SingleVenueView

urlpatterns = [
    path("", VenuesView.as_view(), name="venues"),
    path("categories", VenueCategoriesView.as_view(), name="venue_categories"),
    path("<int:venue_id>", SingleVenueView.as_view(), name="single_venue"),
]