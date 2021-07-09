from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from treeckle.common.exceptions import BadRequest
from users.permission_middlewares import check_access
from users.models import Role, User
from events.middlewares import (
    check_requester_event_same_organization,
    check_event_modifier,
)
from events.logic.sign_up import (
    event_sign_up_to_json,
    create_event_sign_up,
    delete_event_sign_up,
    update_event_sign_ups,
    attend_event_sign_up,
)
from events.models import Event
from events.serializers import PatchEventSignUpSerializer


class SelfSignUpView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_requester_event_same_organization
    def post(self, request, requester: User, event: Event):
        new_event_sign_up = create_event_sign_up(event=event, user=requester)

        data = event_sign_up_to_json(new_event_sign_up)

        return Response(data, status=status.HTTP_201_CREATED)

    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_requester_event_same_organization
    def patch(self, request, requester: User, event: Event):
        attended_event_sign_up = attend_event_sign_up(event=event, user=requester)

        data = event_sign_up_to_json(attended_event_sign_up)

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_requester_event_same_organization
    def delete(self, request, requester: User, event: Event):
        delete_event_sign_up(event=event, user=requester)

        return Response(status=status.HTTP_204_NO_CONTENT)


class SignUpView(APIView):
    @check_access(Role.ORGANIZER, Role.ADMIN)
    @check_requester_event_same_organization
    @check_event_modifier
    def patch(self, request, requester: User, event: Event):
        serializer = PatchEventSignUpSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        actions = serializer.validated_data.get("actions", [])

        updated_event_sign_ups = update_event_sign_ups(
            actions=actions, event=event, organization=requester.organization
        )

        data = [
            event_sign_up_to_json(event_sign_up)
            for event_sign_up in updated_event_sign_ups
        ]

        return Response(data, status=status.HTTP_200_OK)
