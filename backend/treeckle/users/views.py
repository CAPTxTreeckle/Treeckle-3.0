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
    update_user_invites,
    update_users,
    delete_user_invites,
    delete_users,
)
from .models import User, UserInvite, Role
from .permission_middlewares import check_access
from .serializers import (
    PostUserInviteSerializer,
    EmailListSerializer,
    PatchUserSerializer,
    PatchUserInviteSerializer,
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

        try:
            new_user_invites = create_user_invites(
                valid_invitations=valid_invitations,
                organization=requester.organization,
            )
        except Exception as e:
            raise BadRequest(e)

        send_user_invite_emails(user_invites=new_user_invites)

        data = [user_invite_to_json(user_invite) for user_invite in new_user_invites]

        return Response(data, status=status.HTTP_201_CREATED)

    @check_access(Role.ADMIN)
    def patch(self, request, requester: User):
        serializer = PatchUserInviteSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        ## shape: [{id, role}]
        user_invite_data_list = serializer.validated_data.get("users", [])

        ## shape: {id: {role: }}
        user_invite_data_dict = {
            user_invite_data["id"]: {
                field: field_value
                for field, field_value in user_invite_data.items()
                if field != "id"
            }
            for user_invite_data in user_invite_data_list
        }

        updated_user_invites = update_user_invites(
            user_invite_data_dict,
            organization=requester.organization,
        )

        data = [
            user_invite_to_json(user_invite) for user_invite in updated_user_invites
        ]

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ADMIN)
    def delete(self, request, requester: User):
        serializer = EmailListSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        emails_to_be_deleted = serializer.validated_data.get("emails", [])
        deleted_emails = delete_user_invites(
            emails_to_be_deleted,
            organization=requester.organization,
        )

        return Response(deleted_emails, status=status.HTTP_200_OK)


class UsersView(APIView):
    @check_access(Role.ADMIN)
    def get(self, request, requester: User):
        same_organization_users = get_users(
            organization=requester.organization
        ).select_related("organization")

        data = [user_to_json(user) for user in same_organization_users]

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ADMIN)
    def patch(self, request, requester: User):
        serializer = PatchUserSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        ## shape: [{id, name, email, role}]
        user_data_list = serializer.validated_data.get("users", [])

        ## shape: {id: {name: , email: , role: }}
        user_data_dict = {
            user_data["id"]: {
                field: field_value
                for field, field_value in user_data.items()
                if field != "id"
            }
            for user_data in user_data_list
        }

        ## ensure user doesn't change own role
        if "role" in user_data_dict.get(requester.id, {}):
            del user_data_dict[requester.id]["role"]

            if not user_data_dict[requester.id]:
                del user_data_dict[requester.id]

        updated_users = update_users(
            user_data_dict,
            organization=requester.organization,
        )

        data = [user_to_json(user) for user in updated_users]

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ADMIN)
    def delete(self, request, requester: User):
        serializer = EmailListSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        emails_to_be_deleted = serializer.validated_data.get("emails", [])

        ## ensure user doesn't delete its own account
        try:
            emails_to_be_deleted.remove(requester.email)
        except ValueError as e:
            ## self not in emails_to_be_deleted
            pass

        deleted_emails = delete_users(
            emails_to_be_deleted,
            organization=requester.organization,
        )

        return Response(deleted_emails, status=status.HTTP_200_OK)


class SingleUserView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def get(self, request, requester: User, user_id: int):
        try:
            user = get_users(id=user_id).select_related("organization").get()
        except (User.DoesNotExist, User.MultipleObjectsReturned) as e:
            raise NotFound(detail="No user found.", code="no_user_found")
        except Exception as e:
            raise BadRequest(e)

        data = user_to_json(user)

        return Response(data, status=status.HTTP_200_OK)
