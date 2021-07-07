from datetime import datetime

from django.utils.timezone import make_aware
from django.db import IntegrityError

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

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
    PatchBookingSerializer,
    DeleteBookingSerializer,
)
from .models import Booking, BookingStatus
from .middlewares import check_user_is_booker_or_admin
from .logic import (
    get_bookings,
    get_requested_bookings,
    booking_to_json,
    create_bookings,
    delete_bookings,
    DateTimeInterval,
    update_booking_statuses,
)

# Create your views here.
class TotalBookingCountView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        data = get_bookings().count()

        return Response(data, status=status.HTTP_200_OK)


class PendingBookingCountView(APIView):
    @check_access(Role.ADMIN)
    def get(self, request, requester: User):
        data = get_bookings(
            status=BookingStatus.PENDING, venue__organization=requester.organization
        ).count()

        return Response(data, status=status.HTTP_200_OK)


class BookingsView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def get(self, request, requester: User):
        serializer = GetBookingSerializer(data=request.query_params.dict())

        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        start_date_time = validated_data.get("start_date_time", None)
        end_date_time = validated_data.get("end_date_time", None)

        bookings = get_requested_bookings(
            organization=requester.organization,
            user_id=validated_data.get("user_id", None),
            venue_name=validated_data.get("venue_name", None),
            start_date_time=parse_ms_timestamp_to_datetime(start_date_time)
            if start_date_time is not None
            else make_aware(datetime.min),
            end_date_time=parse_ms_timestamp_to_datetime(end_date_time)
            if end_date_time is not None
            else make_aware(datetime.max),
            status=validated_data.get("status", None),
        )

        data = [booking_to_json(booking) for booking in bookings]

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

        except (Venue.DoesNotExist, Venue.MultipleObjectsReturned) as e:
            raise BadRequest("Invalid venue")

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

        try:
            new_bookings = create_bookings(
                title=validated_data.get("title", ""),
                booker=requester,
                venue=venue,
                new_date_time_intervals=new_date_time_intervals,
                form_response_data=validated_data.get("form_response_data", []),
            )
        except Exception as e:
            raise BadRequest(e)

        send_created_booking_emails(bookings=new_bookings)

        data = [booking_to_json(booking) for booking in new_bookings]

        return Response(data, status=status.HTTP_201_CREATED)

    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def patch(self, request, requester: User):
        serializer = PatchBookingSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        actions = serializer.validated_data.get("actions", [])

        try:
            (
                updated_bookings,
                id_to_previous_booking_status_mapping,
            ) = update_booking_statuses(actions=actions, user=requester)
        except Exception as e:
            raise BadRequest(e)

        send_updated_booking_emails(
            bookings=updated_bookings,
            id_to_previous_booking_status_mapping=id_to_previous_booking_status_mapping,
        )

        data = [booking_to_json(booking) for booking in updated_bookings]

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ADMIN)
    def delete(self, request, requester: User):
        serializer = DeleteBookingSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        booking_ids_to_be_deleted = serializer.validated_data.get("ids", [])

        deleted_bookings = delete_bookings(
            booking_ids_to_be_deleted, organization=requester.organization
        )

        data = [booking_to_json(booking) for booking in deleted_bookings]

        return Response(data, status=status.HTTP_200_OK)


class SingleBookingsView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_user_is_booker_or_admin
    def get(self, request, requester: User, booking: Booking):
        data = booking_to_json(booking)

        return Response(data, status=status.HTTP_200_OK)
