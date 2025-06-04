from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter

from treeckle.common.exceptions import BadRequest
from email_service.logic import send_user_invite_emails
from .logic import (
    get_user_invites,
    get_users,
    user_invite_to_json,
    user_to_json,
    get_valid_invitations,
    create_user_invites,
    requester_to_json,
    update_requester,
)
from .models import User, UserInvite, Role
from .permission_middlewares import check_access
from .middlewares import (
    check_requester_user_invite_same_organization,
    check_requester_user_same_organization,
)
from .serializers import (
    PostUserInviteSerializer,
    PatchSingleUserSerializer,
    PatchSingleUserInviteSerializer,
    PatchRequesterSerializer,
)


# Create your views here.
@extend_schema_view(
    get=extend_schema(
        summary="List User Invitations",
        description="Retrieve all pending user invitations for the organization. Admin access required.",
        tags=["User Invitations"],
        responses={
            200: {
                "description": "List of user invitations retrieved successfully",
                "example": [
                    {
                        "id": 1,
                        "email": "user@example.com",
                        "role": "RESIDENT",
                        "organization": "Test Organization",
                        "createdAt": 1647875400000,
                        "updatedAt": 1647875400000
                    }
                ]
            },
            401: {"description": "Authentication required"},
            403: {"description": "Admin access required"}
        }
    ),
    post=extend_schema(
        summary="Create User Invitations",
        description="Send email invitations to new users to join the organization. Admin access required.",
        tags=["User Invitations"],
        request={
            "application/json": {
                "example": {
                    "invitations": [
                        {
                            "email": "newuser@example.com",
                            "role": "RESIDENT"
                        },
                        {
                            "email": "organizer@example.com", 
                            "role": "ORGANIZER"
                        }
                    ]
                }
            }
        },
        responses={
            201: {
                "description": "User invitations created and emails sent successfully",
                "example": [
                    {
                        "id": 2,
                        "email": "newuser@example.com",
                        "role": "RESIDENT",
                        "organization": "Test Organization",
                        "createdAt": 1647875400000,
                        "updatedAt": 1647875400000
                    }
                ]
            },
            400: {"description": "Invalid invitation data"},
            401: {"description": "Authentication required"},
            403: {"description": "Admin access required"}        }
    )
)
class UserInvitesView(APIView):
    @check_access(Role.ADMIN)
    def get(self, request, requester: User):
        """
        Retrieve all pending user invitations for the requester's organization.
        
        Returns a list of user invitations that are pending acceptance,
        filtered by the requester's organization.
        """
        same_organization_user_invites = get_user_invites(
            organization=requester.organization
        ).select_related("organization")

        data = [
            user_invite_to_json(user_invite)
            for user_invite in same_organization_user_invites
        ]

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ADMIN)
    def post(self, request, requester: User):
        """
        Create user invitations and send invitation emails.
        
        Validates invitation data, filters out existing users/invitations,
        creates new user invitations, and sends email invitations to valid users.
        """
        serializer = PostUserInviteSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        ## shape: [{email:, role:}]
        invitations = serializer.validated_data.get("invitations", [])

        ## shape: [(email, role)]
        valid_invitations = get_valid_invitations(invitations)

        new_user_invites = create_user_invites(
            valid_invitations=valid_invitations,
            organization=requester.organization,
        )

        send_user_invite_emails(user_invites=new_user_invites)

        data = [user_invite_to_json(user_invite) for user_invite in new_user_invites]

        return Response(data, status=status.HTTP_201_CREATED)


@extend_schema_view(
    patch=extend_schema(
        summary="Update User Invitation",
        description="Update a user invitation's role. Admin access required.",
        tags=["User Invitations"],
        request={
            "application/json": {
                "example": {
                    "role": "ORGANIZER"
                }
            }
        },
        responses={
            200: {
                "description": "User invitation updated successfully",
                "example": {
                    "id": 1,
                    "email": "user@example.com",
                    "role": "ORGANIZER",
                    "organization": "Test Organization",
                    "createdAt": 1647875400000,
                    "updatedAt": 1647875500000
                }
            },
            400: {"description": "Invalid role data"},
            401: {"description": "Authentication required"},
            403: {"description": "Admin access required"},
            404: {"description": "User invitation not found"}
        }
    ),
    delete=extend_schema(
        summary="Delete User Invitation",
        description="Delete a pending user invitation. Admin access required.",
        tags=["User Invitations"],
        responses={
            200: {
                "description": "User invitation deleted successfully",
                "example": {
                    "id": 1,
                    "email": "user@example.com",
                    "role": "RESIDENT",
                    "organization": "Test Organization",
                    "createdAt": 1647875400000,
                    "updatedAt": 1647875400000
                }
            },
            401: {"description": "Authentication required"},
            403: {"description": "Admin access required"},
            404: {"description": "User invitation not found"}        }
    )
)
class SingleUserInviteView(APIView):
    @check_access(Role.ADMIN)
    @check_requester_user_invite_same_organization
    def patch(self, request, requester: User, user_invite: UserInvite):
        """
        Update a user invitation's role.
        
        Allows admins to modify the role of a pending user invitation
        within the same organization.
        """
        serializer = PatchSingleUserInviteSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        user_invite.update_from_dict(serializer.validated_data, commit=True)

        data = user_invite_to_json(user_invite)

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ADMIN)
    @check_requester_user_invite_same_organization
    def delete(self, request, requester: User, user_invite: UserInvite):
        """
        Delete a pending user invitation.
        
        Allows admins to cancel a user invitation that hasn't been accepted yet.
        Returns the deleted invitation data.
        """
        data = user_invite_to_json(user_invite)
        user_invite.delete()

        return Response(data, status=status.HTTP_200_OK)


@extend_schema_view(
    get=extend_schema(
        summary="List Organization Users",
        description="Retrieve all users within the same organization. Admin access required.",
        tags=["Users"],
        responses={
            200: {
                "description": "List of users retrieved successfully",
                "example": [
                    {
                        "id": 1,
                        "name": "John Doe",
                        "email": "john@example.com",
                        "organization": "Test Organization",
                        "role": "ADMIN",
                        "profileImage": "https://example.com/profile.jpg",
                        "isSelf": True,
                        "createdAt": 1647875400000,
                        "updatedAt": 1647875400000
                    },
                    {
                        "id": 2,
                        "name": "Jane Smith",
                        "email": "jane@example.com",
                        "organization": "Test Organization",
                        "role": "RESIDENT",
                        "profileImage": None,
                        "isSelf": False,
                        "createdAt": 1647875500000,
                        "updatedAt": 1647875500000
                    }
                ]
            },
            401: {"description": "Authentication required"},
            403: {"description": "Admin access required"}
        }
    )
)
class UsersView(APIView):
    @check_access(Role.ADMIN)
    def get(self, request, requester: User):
        """
        Retrieve all users within the organization.
        
        Returns a list of all users belonging to the same organization as the requester.
        Includes user profile information and marks which user is the requester (isSelf).
        """
        same_organization_users = get_users(
            organization=requester.organization
        ).select_related("organization", "profile_image")

        data = [
            user_to_json(user=user, requester=requester)
            for user in same_organization_users
        ]

        return Response(data, status=status.HTTP_200_OK)


@extend_schema_view(
    get=extend_schema(
        summary="Get Current User Profile",
        description="Retrieve the current authenticated user's detailed profile information including authentication methods.",
        tags=["User Profile"],
        responses={
            200: {
                "description": "User profile retrieved successfully",
                "example": {
                    "id": 1,
                    "name": "John Doe",
                    "email": "john@example.com",
                    "organization": "Test Organization",
                    "role": "ADMIN",
                    "profileImage": "https://example.com/profile.jpg",
                    "isSelf": True,
                    "hasPasswordAuth": True,
                    "googleAuth": {
                        "email": "john@gmail.com",
                        "profileImage": "https://google.com/profile.jpg"
                    },
                    "facebookAuth": None,
                    "createdAt": 1647875400000,
                    "updatedAt": 1647875400000
                }
            },
            401: {"description": "Authentication required"}
        }
    ),
    patch=extend_schema(
        summary="Update User Profile",
        description="Update the current user's profile or authentication settings. Supports updating name, profile image, password, and linking/unlinking social accounts.",
        tags=["User Profile"],
        request={
            "application/json": {
                "examples": {
                    "update_name": {
                        "summary": "Update Name",
                        "value": {
                            "action": "NAME",
                            "payload": {"name": "New Name"}
                        }
                    },
                    "update_password": {
                        "summary": "Update Password",
                        "value": {
                            "action": "PASSWORD",
                            "payload": {"password": "newpassword123"}
                        }
                    },
                    "link_google": {
                        "summary": "Link Google Account",
                        "value": {
                            "action": "GOOGLE",
                            "payload": {"token": "google_token_here"}
                        }
                    },
                    "unlink_google": {
                        "summary": "Unlink Google Account",
                        "value": {
                            "action": "GOOGLE",
                            "payload": None
                        }
                    },
                    "update_profile_image": {
                        "summary": "Update Profile Image",
                        "value": {
                            "action": "PROFILE_IMAGE",
                            "payload": {"profile_image": "base64_image_data"}
                        }
                    },
                    "remove_profile_image": {
                        "summary": "Remove Profile Image",
                        "value": {
                            "action": "PROFILE_IMAGE",
                            "payload": None
                        }
                    }
                }
            }
        },
        responses={
            200: {
                "description": "User profile updated successfully",
                "example": {
                    "id": 1,
                    "name": "Updated Name",
                    "email": "john@example.com",
                    "organization": "Test Organization",
                    "role": "ADMIN",
                    "profileImage": "https://example.com/new-profile.jpg",
                    "isSelf": True,
                    "hasPasswordAuth": True,
                    "googleAuth": {
                        "email": "john@gmail.com",
                        "profileImage": "https://google.com/profile.jpg"
                    },
                    "facebookAuth": None,
                    "createdAt": 1647875400000,
                    "updatedAt": 1647875400000
                }
            },
            400: {"description": "Invalid action or payload data"},
            401: {"description": "Authentication required"}
        }
    )
)
class RequesterView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def get(self, request, requester: User):
        """
        Get the current user's detailed profile information.
        
        Returns comprehensive profile data including authentication methods,
        profile image, and other user details for the authenticated user.
        """
        data = requester_to_json(requester)

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def patch(self, request, requester: User):
        """
        Update the current user's profile or authentication settings.
        
        Supports various actions:
        - NAME: Update display name
        - PROFILE_IMAGE: Upload/remove profile image  
        - PASSWORD: Update password
        - GOOGLE: Link/unlink Google account
        - FACEBOOK: Link/unlink Facebook account
        """
        serializer = PatchRequesterSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        updated_requester = update_requester(
            requester=requester,
            action=validated_data.get("action"),
            payload=validated_data.get("payload"),
        )

        data = requester_to_json(updated_requester)

        return Response(data, status=status.HTTP_200_OK)


@extend_schema_view(
    get=extend_schema(
        summary="Get User Details",
        description="Retrieve detailed information about a specific user. All authenticated users can view users from their organization.",
        tags=["Users"],
        parameters=[
            OpenApiParameter(
                name="user_id",
                type=int,
                location=OpenApiParameter.PATH,
                description="The ID of the user to retrieve"
            )
        ],
        responses={
            200: {
                "description": "User details retrieved successfully",
                "example": {
                    "id": 2,
                    "name": "Jane Smith",
                    "email": "jane@example.com",
                    "organization": "Test Organization",
                    "role": "RESIDENT",
                    "profileImage": "https://example.com/profile.jpg",
                    "isSelf": False,
                    "createdAt": 1647875400000,
                    "updatedAt": 1647875400000
                }
            },
            401: {"description": "Authentication required"},
            403: {"description": "Access denied - insufficient permissions"},
            404: {"description": "User not found or not in same organization"}
        }
    ),
    patch=extend_schema(
        summary="Update User",
        description="Update a user's profile information. Only admins can update users, and cannot modify their own role.",
        tags=["Users"],
        parameters=[
            OpenApiParameter(
                name="user_id",
                type=int,
                location=OpenApiParameter.PATH,
                description="The ID of the user to update"
            )
        ],
        request={
            "application/json": {
                "examples": {
                    "update_name": {
                        "summary": "Update Name Only",
                        "value": {"name": "Updated Name"}
                    },
                    "update_email": {
                        "summary": "Update Email Only",
                        "value": {"email": "newemail@example.com"}
                    },
                    "update_role": {
                        "summary": "Update Role Only",
                        "value": {"role": "ORGANIZER"}
                    },
                    "update_multiple": {
                        "summary": "Update Multiple Fields",
                        "value": {
                            "name": "John Smith",
                            "email": "johnsmith@example.com",
                            "role": "ADMIN"
                        }
                    }
                }
            }
        },
        responses={
            200: {
                "description": "User updated successfully",
                "example": {
                    "id": 2,
                    "name": "Updated Name",
                    "email": "newemail@example.com",
                    "organization": "Test Organization",
                    "role": "ORGANIZER",
                    "profileImage": "https://example.com/profile.jpg",
                    "isSelf": False,
                    "createdAt": 1647875400000,
                    "updatedAt": 1647875400000
                }
            },
            400: {"description": "Invalid data or cannot self-update role"},
            401: {"description": "Authentication required"},
            403: {"description": "Admin access required"},
            404: {"description": "User not found or not in same organization"}
        }
    ),
    delete=extend_schema(
        summary="Delete User",
        description="Delete a user from the organization. Admins cannot delete themselves.",
        tags=["Users"],
        parameters=[
            OpenApiParameter(
                name="user_id",
                type=int,
                location=OpenApiParameter.PATH,
                description="The ID of the user to delete"
            )
        ],
        responses={
            200: {
                "description": "User deleted successfully",
                "example": {
                    "id": 2,
                    "name": "Deleted User",
                    "email": "deleted@example.com",
                    "organization": "Test Organization",
                    "role": "RESIDENT",
                    "profileImage": None,
                    "isSelf": False,
                    "createdAt": 1647875400000,
                    "updatedAt": 1647875400000
                }
            },
            400: {"description": "Cannot self-delete"},
            401: {"description": "Authentication required"},
            403: {"description": "Admin access required"},
            404: {"description": "User not found or not in same organization"}
        }
    )
)
class SingleUserView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_requester_user_same_organization
    def get(self, request, requester: User, user: User):
        """
        Retrieve detailed information about a specific user.
        
        All authenticated users can view profile information of users
        within their organization.
        """
        data = user_to_json(user=user, requester=requester)

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ADMIN)
    @check_requester_user_same_organization
    def patch(self, request, requester: User, user: User):
        """
        Update a user's profile information.
        
        Allows admins to update name, email, and role of users within
        their organization. Admins cannot modify their own role.
        """
        serializer = PatchSingleUserSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        if requester == user and "role" in validated_data:
            raise BadRequest(detail="Cannot self-update role", code="self_update_role")

        user.update_from_dict(validated_data, commit=True)

        data = user_to_json(user=user, requester=requester)

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ADMIN)
    @check_requester_user_same_organization
    def delete(self, request, requester: User, user: User):
        """
        Delete a user from the organization.
        
        Allows admins to remove users from their organization.
        Admins cannot delete themselves. Returns the deleted user data.
        """
        if requester == user:
            raise BadRequest(detail="Cannot self-delete", code="self_delete")

        data = user_to_json(user=user, requester=requester)
        user.delete()

        return Response(data, status=status.HTTP_200_OK)
