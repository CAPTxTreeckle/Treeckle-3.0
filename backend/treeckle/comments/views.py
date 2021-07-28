from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from treeckle.common.exceptions import InternalServerError, BadRequest
from users.permission_middlewares import check_access
from users.models import Role, User
from .serializers import PostCommentSerializer, PostReadCommentSerializer
from .models import Booking, Comment
from .middlewares import check_comment_is_active, check_requester_is_commenter
from bookings.middlewares import check_requester_is_booker_or_admin, check_requester_booking_same_organization
from .logic import (
    create_booking_comment,
    get_booking_comments,
    comment_to_json,
    booking_comment_to_json,
    update_comment,
    delete_comment,
    create_comment_reads
)

# Create your views here.

# Not used
class BookingCommentsView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_requester_booking_same_organization
    @check_requester_is_booker_or_admin
    def get(self, request, requester: User, booking: Booking):
        booking_comments = get_booking_comments(booking=booking).select_related(
            "comment__commenter__organization", "comment__commenter__profile_image", "booking"
        )

        data = [
            booking_comment_to_json(booking_comment)
            for booking_comment in booking_comments
        ]

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_requester_booking_same_organization
    @check_requester_is_booker_or_admin
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
    @check_requester_is_commenter
    @check_comment_is_active
    def put(self, request, requester: User, comment: Comment):
        serializer = PostCommentSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        content = serializer.validated_data["content"]

        updated_comment = update_comment(comment=comment, content=content)

        data = comment_to_json(updated_comment)
        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_requester_is_commenter
    @check_comment_is_active
    def delete(self, request, requester: User, comment: Comment):
        try:
            deleted_comment = delete_comment(comment=comment)
        except Exception as e:
            raise InternalServerError(e)

        data = comment_to_json(deleted_comment)
        return Response(data, status=status.HTTP_200_OK)

class ReadCommentsView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def post(self, request, requester: User):
        serializer = PostReadCommentSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        comment_ids = serializer.validated_data["comment_ids"]
        
        created_comment_reads = create_comment_reads(comment_ids=comment_ids, user=requester)
        # TODO: return relevant data such as number of unread comments
        data = [comment_to_json(comment_read.comment) for comment_read in created_comment_reads]

        return Response(data, status=status.HTTP_201_CREATED)
