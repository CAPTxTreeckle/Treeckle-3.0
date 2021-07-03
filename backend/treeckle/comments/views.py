from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from treeckle.common.exceptions import InternalServerError, BadRequest
from users.permission_middlewares import check_access
from users.models import Role, User
from .serializers import PostCommentSerializer
from .models import Booking, Comment
from .middlewares import check_user_is_commenter
from bookings.middlewares import check_user_is_booker_or_admin
from .logic import (
    create_booking_comment,
    get_booking_comments,
    comment_to_json,
    booking_comment_to_json,
    update_comment,
    delete_comment,
)

# Create your views here.


class BookingCommentsView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_user_is_booker_or_admin
    def get(self, request, requester: User, booking: Booking):
        booking_comments = get_booking_comments(booking=booking).select_related(
            "comment__commenter__organization", "booking"
        )

        data = [
            booking_comment_to_json(booking_comment)
            for booking_comment in booking_comments
        ]

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_user_is_booker_or_admin
    def post(self, request, requester: User, booking: Booking):
        serializer = PostCommentSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        content = serializer.validated_data["content"]

        try:
            booking_comment = create_booking_comment(
                booking=booking, commenter=requester, content=content
            )

        except Exception as e:
            raise InternalServerError(e)

        data = booking_comment_to_json(booking_comment)

        return Response(data, status=status.HTTP_201_CREATED)


class SingleCommentView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_user_is_commenter
    def put(self, request, requester: User, comment: Comment):
        if not comment.is_active:
            raise BadRequest("Comment has been deleted.")

        serializer = PostCommentSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        content = serializer.validated_data["content"]

        try:
            updated_comment = update_comment(comment=comment, content=content)
        except Exception as e:
            raise InternalServerError(e)

        data = comment_to_json(updated_comment)
        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_user_is_commenter
    def delete(self, request, requester: User, comment: Comment):
        if not comment.is_active:
            raise BadRequest("Comment has already been deleted.")

        try:
            deleted_comment = delete_comment(comment=comment)
        except Exception as e:
            raise InternalServerError(e)

        data = comment_to_json(deleted_comment)
        return Response(data, status=status.HTTP_200_OK)
