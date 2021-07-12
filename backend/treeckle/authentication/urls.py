from django.urls import path
from .views import (
    GmailLoginView,
    OpenIdLoginView,
    PasswordLoginView,
    AccessTokenRefreshView,
    CheckAccountView,
)

urlpatterns = [
    path("openid", OpenIdLoginView.as_view(), name="openid_login"),
    path("gmail", GmailLoginView.as_view(), name="gmail_login"),
    path("login", PasswordLoginView.as_view(), name="password_login"),
    path("refresh", AccessTokenRefreshView.as_view(), name="token_refresh"),
    path("check", CheckAccountView.as_view(), name="check_account"),
]
