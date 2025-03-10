from rest_framework_simplejwt.views import TokenViewBase
from .serializers import (
    OpenIdLoginSerializer,
    GoogleLoginSerializer,
    FacebookLoginSerializer,
    PasswordLoginSerializer,
    AccessTokenRefreshSerializer,
    CheckAccountSerializer,
    PasswordResetSerializer,
)


# Create your views here.
class GoogleLoginView(TokenViewBase):
    serializer_class = GoogleLoginSerializer


class FacebookLoginView(TokenViewBase):
    serializer_class = FacebookLoginSerializer


class OpenIdLoginView(TokenViewBase):
    serializer_class = OpenIdLoginSerializer


class PasswordLoginView(TokenViewBase):
    serializer_class = PasswordLoginSerializer


class AccessTokenRefreshView(TokenViewBase):
    serializer_class = AccessTokenRefreshSerializer


class CheckAccountView(TokenViewBase):
    serializer_class = CheckAccountSerializer


class PasswordResetView(TokenViewBase):
    serializer_class = PasswordResetSerializer
