from django.urls import path

from .views import UserInvitesView, UsersView

urlpatterns = [
    path("", UsersView.as_view(), name="users"),
    path("invite", UserInvitesView.as_view(), name="user_invites"),
]