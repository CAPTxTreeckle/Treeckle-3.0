from rest_framework_simplejwt.views import TokenViewBase
from .serializers import (
    OpenIdLoginSerializer,
    GmailLoginSerializer,
    PasswordLoginSerializer,
    AccessTokenRefreshSerializer,
    CheckAccountSerializer,
)

# Create your views here.
class GmailLoginView(TokenViewBase):
    serializer_class = GmailLoginSerializer


class OpenIdLoginView(TokenViewBase):
    serializer_class = OpenIdLoginSerializer


class PasswordLoginView(TokenViewBase):
    serializer_class = PasswordLoginSerializer


class AccessTokenRefreshView(TokenViewBase):
    serializer_class = AccessTokenRefreshSerializer


class CheckAccountView(TokenViewBase):
    serializer_class = CheckAccountSerializer
