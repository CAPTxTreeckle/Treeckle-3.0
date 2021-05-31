from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from treeckle.common.exceptions import BadRequest
from users.permission_middlewares import check_access
from users.models import Role, User
from .logic import (
    organization_listener_to_json,
    get_organization_listeners,
    create_organization_listeners,
    delete_organization_listeners,
)
from .serializers import (
    PostOrganizationListenerSerializer,
    DeleteOrganizationListenerSerializer,
)

# Create your views here.
class OrganizationListenersView(APIView):
    @check_access(Role.ADMIN)
    def get(self, request, requester: User):
        same_organization_listeners = get_organization_listeners(
            organization=requester.organization
        )

        data = [
            organization_listener_to_json(listener)
            for listener in same_organization_listeners
        ]

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ADMIN)
    def post(self, request, requester: User):
        serializer = PostOrganizationListenerSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        try:
            new_organization_listeners = create_organization_listeners(
                listenerData=serializer.validated_data.get("listeners", []),
                organization=requester.organization,
            )
        except Exception as e:
            raise BadRequest(e)

        data = [
            organization_listener_to_json(listener)
            for listener in new_organization_listeners
        ]

        return Response(data, status=status.HTTP_201_CREATED)

    @check_access(Role.ADMIN)
    def delete(self, request, requester: User):
        serializer = DeleteOrganizationListenerSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        deleted_organization_listeners = delete_organization_listeners(
            listener_ids_to_be_deleted=serializer.validated_data.get("ids", []),
            organization=requester.organization,
        )

        data = [
            organization_listener_to_json(listener)
            for listener in deleted_organization_listeners
        ]

        return Response(data, status=status.HTTP_200_OK)
