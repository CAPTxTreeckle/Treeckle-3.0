from django.urls import path

from .views import UserInvitesView, UsersView, SingleUserView

urlpatterns = [
    path("", UsersView.as_view(), name="users"),
    path("invite", UserInvitesView.as_view(), name="user_invites"),
    path("<int:user_id>", SingleUserView.as_view(), name="single_user"),
]
