from django.urls import path
from .views import (
    GoogleLoginView,
    FacebookLoginView,
    PasswordLoginView,
    AccessTokenRefreshView,
    CheckAccountView,
    PasswordResetView,
)

urlpatterns = [
    path("google", GoogleLoginView.as_view(), name="google_login"),
    path("facebook", FacebookLoginView.as_view(), name="facebook_login"),
    path("login", PasswordLoginView.as_view(), name="password_login"),
    path("refresh", AccessTokenRefreshView.as_view(), name="token_refresh"),
    path("check", CheckAccountView.as_view(), name="check_account"),
    path("reset", PasswordResetView.as_view(), name="password_reset"),
]
