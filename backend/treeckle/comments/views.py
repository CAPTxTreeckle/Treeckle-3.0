from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter

from treeckle.common.exceptions import InternalServerError
from users.permission_middlewares import check_access
from users.models import Role, User
from .serializers import PostCommentSerializer, PostReadCommentSerializer
from .models import Booking, Comment
from .middlewares import check_comment_is_active, check_requester_is_commenter
from bookings.middlewares import (
    check_requester_is_booker_or_admin,
    check_requester_booking_same_organization,
)
from .logic import (
    create_booking_comment,
    get_booking_comments,
    comment_to_json,
    booking_comment_to_json,
    update_comment,
    delete_comment,
    create_comment_reads,
)

# Create your views here.


@extend_schema_view(
    get=extend_schema(
        summary="List Booking Comments",
        description="Retrieve all comments for a specific booking. Only accessible by the booker or admins within the same organization.",
        tags=["Booking Comments"],
        parameters=[
            OpenApiParameter(
                name="booking_id",
                type=int,
                location=OpenApiParameter.PATH,
                description="The ID of the booking to retrieve comments for"
            )
        ],
        responses={
            200: {
                "description": "List of booking comments retrieved successfully",
                "example": [
                    {
                        "id": 1,
                        "content": "This is a sample comment",
                        "commenter": {
                            "id": 2,
                            "name": "John Doe",
                            "email": "john@example.com",
                            "organization": "Test Organization",
                            "role": "RESIDENT",
                            "profileImage": "https://example.com/profile.jpg",
                            "isSelf": False,
                            "createdAt": 1647875400000,
                            "updatedAt": 1647875400000
                        },
                        "isActive": True,
                        "createdAt": 1647875400000,
                        "updatedAt": 1647875400000
                    }
                ]
            },
            401: {"description": "Authentication required"},
            403: {"description": "Access denied - must be booker or admin"},
            404: {"description": "Booking not found or not in same organization"}
        }
    ),
    post=extend_schema(
        summary="Create Booking Comment",
        description="Add a new comment to a booking. Only accessible by the booker or admins within the same organization.",
        tags=["Booking Comments"],
        parameters=[
            OpenApiParameter(
                name="booking_id",
                type=int,
                location=OpenApiParameter.PATH,
                description="The ID of the booking to add a comment to"
            )
        ],
        request={
            "application/json": {
                "example": {
                    "content": "This is a new comment on the booking"
                }
            }
        },
        responses={
            201: {
                "description": "Comment created successfully",
                "example": {
                    "id": 2,
                    "content": "This is a new comment on the booking",
                    "commenter": {
                        "id": 1,
                        "name": "Jane Smith",
                        "email": "jane@example.com",
                        "organization": "Test Organization",
                        "role": "ADMIN",
                        "profileImage": None,
                        "isSelf": True,
                        "createdAt": 1647875300000,
                        "updatedAt": 1647875300000
                    },
                    "isActive": True,
                    "createdAt": 1647875500000,
                    "updatedAt": 1647875500000
                }
            },
            400: {"description": "Invalid comment data"},
            401: {"description": "Authentication required"},
            403: {"description": "Access denied - must be booker or admin"},
            404: {"description": "Booking not found or not in same organization"},
            500: {"description": "Internal server error while creating comment"}
        }
    )
)
# Not used
class BookingCommentsView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_requester_booking_same_organization
    @check_requester_is_booker_or_admin
    def get(self, request, requester: User, booking: Booking):
        """
        Retrieve all comments for a specific booking.
        
        Returns a list of comments associated with the booking, including
        commenter information. Only accessible by the booker or admins.
        """
        booking_comments = get_booking_comments(booking=booking).select_related(
            "comment__commenter__organization",
            "comment__commenter__profile_image",
            "booking",
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
        """
        Create a new comment on a booking.
        
        Allows the booker or admins to add comments to the booking.
        The comment will be associated with the requester as the commenter.
        """
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


@extend_schema_view(
    put=extend_schema(
        summary="Update Comment",
        description="Update the content of an existing comment. Only the commenter can update their own active comments.",
        tags=["Comments"],
        parameters=[
            OpenApiParameter(
                name="comment_id",
                type=int,
                location=OpenApiParameter.PATH,
                description="The ID of the comment to update"
            )
        ],
        request={
            "application/json": {
                "example": {
                    "content": "This is the updated comment content"
                }
            }
        },
        responses={
            200: {
                "description": "Comment updated successfully",
                "example": {
                    "id": 1,
                    "content": "This is the updated comment content",
                    "commenter": {
                        "id": 2,
                        "name": "John Doe",
                        "email": "john@example.com",
                        "organization": "Test Organization",
                        "role": "RESIDENT",
                        "profileImage": None,
                        "isSelf": True,
                        "createdAt": 1647875400000,
                        "updatedAt": 1647875400000
                    },
                    "isActive": True,
                    "createdAt": 1647875400000,
                    "updatedAt": 1647875600000
                }
            },
            400: {"description": "Invalid comment data"},
            401: {"description": "Authentication required"},
            403: {"description": "Access denied - only commenter can update"},
            404: {"description": "Comment not found or inactive"}
        }
    ),
    delete=extend_schema(
        summary="Delete Comment",
        description="Soft delete a comment by marking it as inactive. Only the commenter can delete their own active comments.",
        tags=["Comments"],
        parameters=[
            OpenApiParameter(
                name="comment_id",
                type=int,
                location=OpenApiParameter.PATH,
                description="The ID of the comment to delete"
            )
        ],
        responses={
            200: {
                "description": "Comment deleted successfully",
                "example": {
                    "id": 1,
                    "content": "This comment has been deleted.",
                    "commenter": {
                        "id": 2,
                        "name": "John Doe",
                        "email": "john@example.com",
                        "organization": "Test Organization",
                        "role": "RESIDENT",
                        "profileImage": None,
                        "isSelf": True,
                        "createdAt": 1647875400000,
                        "updatedAt": 1647875400000
                    },
                    "isActive": False,
                    "createdAt": 1647875400000,
                    "updatedAt": 1647875700000
                }
            },
            401: {"description": "Authentication required"},
            403: {"description": "Access denied - only commenter can delete"},
            404: {"description": "Comment not found or inactive"},
            500: {"description": "Internal server error while deleting comment"}
        }
    )
)
class SingleCommentView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_requester_is_commenter
    @check_comment_is_active
    def put(self, request, requester: User, comment: Comment):
        """
        Update the content of an existing comment.
        
        Allows the original commenter to modify their comment content.
        Only active comments can be updated.
        """
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
        """
        Soft delete a comment by marking it as inactive.
        
        The comment content will be replaced with a deletion message
        but the comment record is preserved for audit purposes.
        """
        try:
            deleted_comment = delete_comment(comment=comment)
        except Exception as e:
            raise InternalServerError(e)

        data = comment_to_json(deleted_comment)
        return Response(data, status=status.HTTP_200_OK)


@extend_schema_view(
    post=extend_schema(
        summary="Mark Comments as Read",
        description="Mark multiple comments as read by the current user. Creates read records for comment tracking.",
        tags=["Comment Reads"],
        request={
            "application/json": {
                "example": {
                    "comment_ids": [1, 2, 3, 5, 8]
                }
            }
        },
        responses={
            201: {
                "description": "Comments marked as read successfully",
                "example": [
                    {
                        "id": 1,
                        "content": "First comment content",
                        "commenter": {
                            "id": 2,
                            "name": "Jane Doe",
                            "email": "jane@example.com",
                            "organization": "Test Organization",
                            "role": "RESIDENT",
                            "profileImage": None,
                            "isSelf": False,
                            "createdAt": 1647875300000,
                            "updatedAt": 1647875300000
                        },
                        "isActive": True,
                        "createdAt": 1647875400000,
                        "updatedAt": 1647875400000
                    },
                    {
                        "id": 2,
                        "content": "Second comment content",
                        "commenter": {
                            "id": 3,
                            "name": "Bob Smith",
                            "email": "bob@example.com",
                            "organization": "Test Organization",
                            "role": "ORGANIZER",
                            "profileImage": "https://example.com/bob.jpg",
                            "isSelf": False,
                            "createdAt": 1647875200000,
                            "updatedAt": 1647875200000
                        },
                        "isActive": True,
                        "createdAt": 1647875500000,
                        "updatedAt": 1647875500000
                    }
                ]
            },
            400: {"description": "Invalid comment IDs data"},
            401: {"description": "Authentication required"}
        }
    )
)
class ReadCommentsView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def post(self, request, requester: User):
        """
        Mark multiple comments as read by the current user.
        
        Creates CommentRead records to track which comments have been
        read by the user. Used for notification and unread count features.
        """
        serializer = PostReadCommentSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        comment_ids = serializer.validated_data["comment_ids"]

        created_comment_reads = create_comment_reads(
            comment_ids=comment_ids, user=requester
        )
        # TODO: return relevant data such as number of unread comments
        data = [
            comment_to_json(comment_read.comment)
            for comment_read in created_comment_reads
        ]

        return Response(data, status=status.HTTP_201_CREATED)
