from datetime import datetime
from django.utils.timezone import make_aware

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.openapi import OpenApiResponse, OpenApiTypes

from treeckle.common.exceptions import BadRequest
from treeckle.common.parsers import parse_ms_timestamp_to_datetime
from email_service.logic import send_created_booking_emails, send_updated_booking_emails
from users.permission_middlewares import check_access
from users.models import Role, User
from venues.logic import get_venues
from venues.models import Venue
from .serializers import (
    GetBookingSerializer,
    PostBookingSerializer,
    PatchSingleBookingSerializer,
)
from .models import Booking, BookingStatus
from .middlewares import check_requester_is_booker_or_admin
from .logic import (
    get_bookings,
    get_requested_bookings,
    booking_to_json,
    create_bookings,
    DateTimeInterval,
    update_booking_status,
)
from .middlewares import check_requester_booking_same_organization


# Create your views here.
@extend_schema_view(
    get=extend_schema(
        summary="Get Total Booking Count",
        description="Get the total number of bookings across all organizations (public endpoint)",
        tags=["Bookings - Statistics"],
        responses={
            200: OpenApiResponse(
                description="Total booking count returned successfully"
            ),
        },
    )
)
class TotalBookingCountView(APIView):
    """
    Public endpoint to get total booking count.

    Returns the total number of bookings across all organizations.
    This is a public endpoint that doesn't require authentication.

    Response:
    - Integer representing total booking count
    """

    permission_classes = [AllowAny]

    def get(self, request):
        data = get_bookings().count()

        return Response(data, status=status.HTTP_200_OK)


@extend_schema_view(
    get=extend_schema(
        summary="Get Pending Booking Count",
        description="Get the count of pending bookings for the admin's organization",
        tags=["Bookings - Statistics"],
        responses={
            200: OpenApiResponse(
                description="Pending booking count returned successfully"
            ),
            403: OpenApiResponse(description="Admin access required"),
        },
    )
)
class PendingBookingCountView(APIView):
    """
    Admin endpoint to get pending booking count.

    Returns the number of bookings with PENDING status within the admin's organization.
    Requires admin role access.

    Response:
    - Integer representing pending booking count for the organization
    """

    @check_access(Role.ADMIN)
    def get(self, request, requester: User):
        data = get_bookings(
            status=BookingStatus.PENDING, venue__organization=requester.organization
        ).count()

        return Response(data, status=status.HTTP_200_OK)


@extend_schema_view(
    get=extend_schema(
        summary="Get Bookings",
        description="Retrieve bookings with optional filtering by user, venue, date range, and status",
        tags=["Bookings"],
        parameters=[
            OpenApiParameter(
                name="user_id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description="Filter bookings by user ID",
                required=False,
            ),
            OpenApiParameter(
                name="venue_id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description="Filter bookings by venue ID",
                required=False,
            ),
            OpenApiParameter(
                name="start_date_time",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description="Filter bookings starting from this timestamp (milliseconds)",
                required=False,
            ),
            OpenApiParameter(
                name="end_date_time",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description="Filter bookings ending before this timestamp (milliseconds)",
                required=False,
            ),
            OpenApiParameter(
                name="statuses",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Comma-separated list of booking statuses (PENDING,APPROVED,REJECTED,CANCELLED)",
                required=False,
            ),
            OpenApiParameter(
                name="full_details",
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
                description="Whether to return full booking details",
                required=False,
            ),
        ],
        responses={
            200: OpenApiResponse(description="List of bookings returned successfully"),
            400: OpenApiResponse(description="Invalid query parameters"),
            403: OpenApiResponse(description="Insufficient permissions"),
        },
    ),
    post=extend_schema(
        summary="Create New Booking",
        description="Create one or more bookings for specified date/time ranges at a venue",
        tags=["Bookings"],
        responses={
            201: OpenApiResponse(description="Bookings created successfully"),
            400: OpenApiResponse(description="Invalid booking data or venue not found"),
            403: OpenApiResponse(description="Insufficient permissions"),
        },
    ),
)
class BookingsView(APIView):
    """
    Bookings management endpoint.

    GET: Retrieve bookings with optional filtering
    - Supports filtering by user_id, venue_id, date range, statuses
    - Returns basic or full details based on full_details parameter
    - Accessible by residents, organizers, and admins

    POST: Create new bookings
    - Creates bookings for multiple date/time ranges at once
    - Sends notification emails to relevant parties
    - Returns the created booking objects
    """

    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def get(self, request, requester: User):
        query_params = request.query_params.dict()

        if "statuses" in query_params:
            query_params["statuses"] = query_params["statuses"].split(",")

        serializer = GetBookingSerializer(data=query_params)

        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        start_date_time = validated_data.get("start_date_time", None)
        end_date_time = validated_data.get("end_date_time", None)

        bookings = get_requested_bookings(
            organization=requester.organization,
            user_id=validated_data.get("user_id", None),
            venue_id=validated_data.get("venue_id", None),
            start_date_time=(
                parse_ms_timestamp_to_datetime(start_date_time)
                if start_date_time is not None
                else make_aware(datetime.min)
            ),
            end_date_time=(
                parse_ms_timestamp_to_datetime(end_date_time)
                if end_date_time is not None
                else make_aware(datetime.max)
            ),
            statuses=validated_data.get("statuses", None),
        )

        full_details = validated_data.get("full_details", False)

        data = [
            booking_to_json(booking, full_details=full_details) for booking in bookings
        ]

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def post(self, request, requester: User):
        serializer = PostBookingSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        try:
            venue = get_venues(
                organization=requester.organization,
                id=validated_data.get("venue_id", None),
            ).get()

        except Venue.DoesNotExist:
            raise BadRequest(detail="Invalid venue", code="invalid_venue")

        ## shape: [{start_date_time:, end_date_time:}]
        date_time_ranges = validated_data.get("date_time_ranges", [])
        ## shape: [(start, end)]
        new_date_time_intervals = [
            DateTimeInterval(
                parse_ms_timestamp_to_datetime(date_time_range["start_date_time"]),
                parse_ms_timestamp_to_datetime(date_time_range["end_date_time"]),
            )
            for date_time_range in date_time_ranges
        ]

        new_bookings = create_bookings(
            title=validated_data.get("title", ""),
            booker=requester,
            venue=venue,
            new_date_time_intervals=new_date_time_intervals,
            form_response_data=validated_data.get("form_response_data", []),
        )

        send_created_booking_emails(bookings=new_bookings)

        data = [booking_to_json(booking) for booking in new_bookings]

        return Response(data, status=status.HTTP_201_CREATED)


@extend_schema_view(
    get=extend_schema(
        summary="Get Single Booking Details",
        description="Retrieve detailed information for a specific booking",
        tags=["Bookings"],
        responses={
            200: OpenApiResponse(description="Booking details returned successfully"),
            403: OpenApiResponse(
                description="Insufficient permissions - must be booker or admin"
            ),
            404: OpenApiResponse(
                description="Booking not found or not in same organization"
            ),
        },
    ),
    patch=extend_schema(
        summary="Update Booking Status",
        description="Update the status of a booking (approve, reject, cancel, revoke)",
        tags=["Bookings"],
        responses={
            200: OpenApiResponse(description="Booking status updated successfully"),
            400: OpenApiResponse(
                description="Invalid action for current booking status"
            ),
            403: OpenApiResponse(
                description="Insufficient permissions - must be booker or admin"
            ),
            404: OpenApiResponse(
                description="Booking not found or not in same organization"
            ),
        },
    ),
    delete=extend_schema(
        summary="Delete Booking",
        description="Permanently delete a booking (admin only)",
        tags=["Bookings"],
        responses={
            200: OpenApiResponse(description="Booking deleted successfully"),
            403: OpenApiResponse(description="Admin access required"),
            404: OpenApiResponse(
                description="Booking not found or not in same organization"
            ),
        },
    ),
)
class SingleBookingView(APIView):
    """
    Individual booking management endpoint.

    GET: Retrieve full details of a specific booking
    - Returns complete booking information
    - Accessible by booking creator or organization admins

    PATCH: Update booking status
    - Actions: APPROVE, REJECT, CANCEL, REVOKE
    - Sends notification emails for status changes
    - Returns updated booking(s) information

    DELETE: Delete booking (admin only)
    - Permanently removes the booking
    - Returns the deleted booking data
    - Admin access required
    """

    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_requester_booking_same_organization
    @check_requester_is_booker_or_admin
    def get(self, request, requester: User, booking: Booking):
        data = booking_to_json(booking, full_details=True)

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_requester_booking_same_organization
    @check_requester_is_booker_or_admin
    def patch(self, request, requester: User, booking: Booking):
        serializer = PatchSingleBookingSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data.get("action")

        (
            updated_bookings,
            id_to_previous_booking_status_mapping,
        ) = update_booking_status(booking=booking, action=action, user=requester)

        send_updated_booking_emails(
            bookings=updated_bookings,
            id_to_previous_booking_status_mapping=id_to_previous_booking_status_mapping,
        )

        data = [booking_to_json(booking) for booking in updated_bookings]

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ADMIN)
    @check_requester_booking_same_organization
    def delete(self, request, requester: User, booking: Booking):
        data = booking_to_json(booking, full_details=True)

        booking.delete()

        return Response(data, status=status.HTTP_200_OK)
