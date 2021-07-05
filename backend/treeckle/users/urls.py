from django.urls import path

from .views import UserInvitesView, SingleUserInviteView, UsersView, SingleUserView

urlpatterns = [
    path("", UsersView.as_view(), name="users"),
    path("invite", UserInvitesView.as_view(), name="user_invites"),
    path(
        "invite/<int:user_invite_id>",
        SingleUserInviteView.as_view(),
        name="single_user_invite",
    ),
    path("<int:user_id>", SingleUserView.as_view(), name="single_user"),
]
