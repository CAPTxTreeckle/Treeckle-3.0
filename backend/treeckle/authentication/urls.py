from django.urls import path
from .views import GmailLoginView, OpenIdLoginView, AccessTokenRefreshView

urlpatterns = [
    path("openid", OpenIdLoginView.as_view(), name="openid_login"),
    path("gmail", GmailLoginView.as_view(), name="gmail_login"),
    path("refresh", AccessTokenRefreshView.as_view(), name="token_refresh"),
]
