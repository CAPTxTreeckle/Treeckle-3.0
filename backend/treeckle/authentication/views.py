from rest_framework_simplejwt.views import TokenViewBase
from .serializers import (
    OpenIdLoginSerializer,
    GmailLoginSerializer,
    AccessTokenRefreshSerializer,
)

# Create your views here.
class GmailLoginView(TokenViewBase):
    serializer_class = GmailLoginSerializer


class OpenIdLoginView(TokenViewBase):
    serializer_class = OpenIdLoginSerializer


class AccessTokenRefreshView(TokenViewBase):
    serializer_class = AccessTokenRefreshSerializer