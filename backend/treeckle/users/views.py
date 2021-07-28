from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound

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
class UserInvitesView(APIView):
    @check_access(Role.ADMIN)
    def get(self, request, requester: User):
        same_organization_user_invites = get_user_invites(
            organization=requester.organization
        )

        data = [
            user_invite_to_json(user_invite)
            for user_invite in same_organization_user_invites
        ]

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ADMIN)
    def post(self, request, requester: User):
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


class SingleUserInviteView(APIView):
    @check_access(Role.ADMIN)
    @check_requester_user_invite_same_organization
    def patch(self, request, requester: User, user_invite: UserInvite):
        serializer = PatchSingleUserInviteSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        user_invite.update_from_dict(serializer.validated_data, commit=True)

        data = user_invite_to_json(user_invite)

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ADMIN)
    @check_requester_user_invite_same_organization
    def delete(self, request, requester: User, user_invite: UserInvite):
        data = user_invite_to_json(user_invite)
        user_invite.delete()

        return Response(data, status=status.HTTP_200_OK)


class UsersView(APIView):
    @check_access(Role.ADMIN)
    def get(self, request, requester: User):
        same_organization_users = get_users(
            organization=requester.organization
        ).select_related("organization", "profile_image")

        data = [
            user_to_json(user=user, requester=requester)
            for user in same_organization_users
        ]

        return Response(data, status=status.HTTP_200_OK)


class RequesterView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def get(self, request, requester: User):
        data = requester_to_json(requester)

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def patch(self, request, requester: User):
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


class SingleUserView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_requester_user_same_organization
    def get(self, request, requester: User, user: User):
        data = user_to_json(user=user, requester=requester)

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ADMIN)
    @check_requester_user_same_organization
    def patch(self, request, requester: User, user: User):
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
        if requester == user:
            raise BadRequest(detail="Cannot self-delete", code="self_delete")

        data = user_to_json(user=user, requester=requester)
        user.delete()

        return Response(data, status=status.HTTP_200_OK)
