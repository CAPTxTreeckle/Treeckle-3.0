from rest_framework_simplejwt.views import TokenViewBase
from drf_spectacular.utils import extend_schema, extend_schema_view
from drf_spectacular.openapi import OpenApiResponse
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
@extend_schema(
    summary="Google OAuth Login",
    description="Authenticate user using Google ID token and return JWT access/refresh tokens with user data",
    tags=["Authentication"],
    responses={
        200: OpenApiResponse(
            description="Successfully authenticated - returns user data and JWT tokens"
        ),
        400: OpenApiResponse(
            description="Invalid Google token or authentication failed"
        ),
    },
)
class GoogleLoginView(TokenViewBase):
    """
    Google OAuth login endpoint.

    Accepts a Google ID token (token_id), validates it with Google's tokeninfo endpoint,
    and returns JWT tokens along with user data. If the user doesn't exist, a new account
    will be created using the Google profile information.

    Request body:
    {
        "token_id": "google_id_token_string"
    }

    Response:
    {
        "user": {...user_data...},
        "tokens": {
            "access": "jwt_access_token",
            "refresh": "jwt_refresh_token"
        }
    }
    """

    serializer_class = GoogleLoginSerializer


@extend_schema(
    summary="Facebook OAuth Login",
    description="Authenticate user using Facebook access token and return JWT access/refresh tokens with user data",
    tags=["Authentication"],
    responses={
        200: OpenApiResponse(
            description="Successfully authenticated - returns user data and JWT tokens"
        ),
        400: OpenApiResponse(
            description="Invalid Facebook token or authentication failed"
        ),
    },
)
class FacebookLoginView(TokenViewBase):
    """
    Facebook OAuth login endpoint.

    Accepts a Facebook access token, validates it with Facebook's debug_token endpoint,
    and returns JWT tokens along with user data. If the user doesn't exist, a new account
    will be created using the Facebook profile information.

    Request body:
    {
        "access_token": "facebook_access_token_string"
    }

    Response:
    {
        "user": {...user_data...},
        "tokens": {
            "access": "jwt_access_token",
            "refresh": "jwt_refresh_token"
        }
    }
    """

    serializer_class = FacebookLoginSerializer


@extend_schema(
    summary="OpenID Connect Login",
    description="Authenticate user using OpenID Connect data and return JWT access/refresh tokens with user data",
    tags=["Authentication"],
    responses={
        200: OpenApiResponse(
            description="Successfully authenticated - returns user data and JWT tokens"
        ),
        400: OpenApiResponse(
            description="Invalid OpenID data or authentication failed"
        ),
    },
)
class OpenIdLoginView(TokenViewBase):
    """
    OpenID Connect login endpoint.

    Accepts OpenID Connect user data (name, email, user_id), creates a NUSNet email format,
    and returns JWT tokens along with user data. If the user doesn't exist, a new account
    will be created.

    Request body:
    {
        "name": "User Name",
        "email": "user@domain.com",
        "user_id": "user_identifier"
    }

    Response:
    {
        "user": {...user_data...},
        "tokens": {
            "access": "jwt_access_token",
            "refresh": "jwt_refresh_token"
        }
    }
    """

    serializer_class = OpenIdLoginSerializer


@extend_schema(
    summary="Password Login",
    description="Authenticate user using name, email and password, return JWT access/refresh tokens with user data",
    tags=["Authentication"],
    responses={
        200: OpenApiResponse(
            description="Successfully authenticated - returns user data and JWT tokens"
        ),
        400: OpenApiResponse(
            description="Invalid credentials or authentication failed"
        ),
    },
)
class PasswordLoginView(TokenViewBase):
    """
    Traditional email/password login endpoint.

    Accepts name, email and password credentials and returns JWT tokens along with user data
    for authenticated users.

    Request body:
    {
        "name": "User Name",
        "email": "user@example.com",
        "password": "user_password"
    }

    Response:
    {
        "user": {...user_data...},
        "tokens": {
            "access": "jwt_access_token",
            "refresh": "jwt_refresh_token"
        }
    }
    """

    serializer_class = PasswordLoginSerializer


@extend_schema(
    summary="Refresh Access Token",
    description="Refresh an expired access token using a valid refresh token and return user data",
    tags=["Authentication"],
    responses={
        200: OpenApiResponse(
            description="New access token generated successfully with user data"
        ),
        400: OpenApiResponse(description="Invalid refresh token"),
        401: OpenApiResponse(description="Refresh token expired or invalid"),
    },
)
class AccessTokenRefreshView(TokenViewBase):
    """
    JWT token refresh endpoint.

    Accepts a valid refresh token and returns a new access token along with current user data.
    The refresh token remains valid for future use until it expires.

    Request body:
    {
        "refresh": "jwt_refresh_token"
    }

    Response:
    {
        "user": {...user_data...},
        "tokens": {
            "access": "new_jwt_access_token",
            "refresh": "jwt_refresh_token"
        }
    }
    """

    serializer_class = AccessTokenRefreshSerializer


@extend_schema(
    summary="Check Account Status",
    description="Check if an account exists for the given email and return basic account information",
    tags=["Authentication"],
    responses={
        200: OpenApiResponse(description="Account found - returns email and name"),
        400: OpenApiResponse(
            description="Account not found (no user or user invite exists)"
        ),
    },
)
class CheckAccountView(TokenViewBase):
    """
    Account verification endpoint.

    Checks if an account exists for the provided email address. Returns basic information
    if found in either the User or UserInvite models.

    Request body:
    {
        "email": "user@example.com"
    }

    Response (if user exists):
    {
        "email": "user@example.com",
        "name": "User Name"
    }

    Response (if only user invite exists):
    {
        "email": "user@example.com"
    }
    """

    serializer_class = CheckAccountSerializer


@extend_schema(
    summary="Password Reset",
    description="Generate new random password for user and send it via email",
    tags=["Authentication"],
    responses={
        200: OpenApiResponse(
            description="Password reset successful - new password sent via email"
        ),
        400: OpenApiResponse(description="User not found with provided email"),
        500: OpenApiResponse(description="Internal server error during password reset"),
    },
)
class PasswordResetView(TokenViewBase):
    """
    Password reset endpoint.

    Generates a new random 8-character password for the user, deletes any existing
    password authentication, creates new password authentication, and sends the new
    password to the user's email.

    Request body:
    {
        "email": "user@example.com"
    }

    Response:
    {
        "email": "user@example.com",
        "name": "User Name"
    }

    Note: The new password is sent to the user's email address.
    """

    serializer_class = PasswordResetSerializer
