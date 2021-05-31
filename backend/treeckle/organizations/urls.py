from django.urls import path

from .views import OrganizationListenersView

urlpatterns = [
    path("listeners", OrganizationListenersView.as_view(), name="listeners"),
]
