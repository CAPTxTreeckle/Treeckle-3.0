from datetime import datetime
from django.utils.timezone import make_aware

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from treeckle.common.constants import COMMENTS
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
from comments.logic import get_booking_comments, booking_comment_to_json
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
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import permission_classes

import requests
import datetime
import json

def get_week_dates(sem_start_date, filtered_data):
    days_added = {'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4}
    week_dates = []
    seen_weeks = set()

    for data in filtered_data:
        day = data['day']
        weeks = data['weeks']

        for week in weeks:
            try:
                week = int(week)
            except ValueError:
                continue
                
            # Add a week after week 6 to account for recess week
            adjusted_week = week - 1 if week < 6 else week
            monday_date = sem_start_date + datetime.timedelta(weeks=adjusted_week)
            
            if week not in seen_weeks:
                seen_weeks.add(week)
                friday_date = monday_date + datetime.timedelta(days=4)
                week_dates.append({
                    "week": week,
                    "start_date": monday_date.strftime("%d %b %Y"),
                    "end_date": friday_date.strftime("%d %b %Y")
                })
    
    return sorted(week_dates, key=lambda x: x['week'])

@api_view(['GET'])
@permission_classes([AllowAny])
def get_academic_weeks(request):
    try:
        result = []
        reference_mod = 'CS1010S'
        
        # Fetch module data from NUSMods API
        response = requests.get(f"https://api.nusmods.com/v2/2024-2025/modules/{reference_mod}.json")
        response.raise_for_status()  # Raise exception for bad status codes
        module_data = response.json()

        # Define semester start dates
        sem_start_dates = {
            1: datetime.date(2024, 8, 5),
            2: datetime.date(2025, 1, 13),
            3: datetime.date(2025, 5, 12)
        }

        for semester in module_data.get("semesterData", []):
            timetable = semester.get("timetable", [])
            if not timetable:
                continue
                
            filtered_data = [
                {
                    'semester': semester['semester'],
                    'weeks': entry['weeks'],
                    'day': entry['day']
                }
                for entry in timetable
            ]

            if filtered_data:
                sem_num = filtered_data[0]['semester']
                week_dates = get_week_dates(sem_start_dates[sem_num], filtered_data)
                
                if week_dates:
                    result.append({
                        "semester": sem_num,
                        "weeks": week_dates
                    })

        return Response(result)

    except requests.RequestException as e:
        return Response(
            {"error": f"Failed to fetch data from NUSMods API: {str(e)}"},
            status=500
        )
    except Exception as e:
        return Response(
            {"error": f"An unexpected error occurred: {str(e)}"},
            status=500
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
            start_date_time=parse_ms_timestamp_to_datetime(start_date_time)
            if start_date_time is not None
            else make_aware(datetime.min),
            end_date_time=parse_ms_timestamp_to_datetime(end_date_time)
            if end_date_time is not None
            else make_aware(datetime.max),
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

        except Venue.DoesNotExist as e:
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


class SingleBookingView(APIView):
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
