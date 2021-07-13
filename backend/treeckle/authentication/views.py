from rest_framework_simplejwt.views import TokenViewBase
from .serializers import (
    OpenIdLoginSerializer,
    GoogleLoginSerializer,
    PasswordLoginSerializer,
    AccessTokenRefreshSerializer,
    CheckAccountSerializer,
)

# Create your views here.
class GoogleLoginView(TokenViewBase):
    serializer_class = GoogleLoginSerializer


class OpenIdLoginView(TokenViewBase):
    serializer_class = OpenIdLoginSerializer


class PasswordLoginView(TokenViewBase):
    serializer_class = PasswordLoginSerializer


class AccessTokenRefreshView(TokenViewBase):
    serializer_class = AccessTokenRefreshSerializer


class CheckAccountView(TokenViewBase):
    serializer_class = CheckAccountSerializer
