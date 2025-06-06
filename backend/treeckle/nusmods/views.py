from rest_framework.decorators import api_view, renderer_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from djangorestframework_camel_case.render import CamelCaseJSONRenderer
from drf_spectacular.utils import extend_schema, OpenApiResponse

import requests
import datetime
import json


def get_week_dates(sem_start_date, filtered_data):
    """
    Calculate week dates for a semester based on start date and timetable data.

    Args:
        sem_start_date: The Monday of the first week of the semester
        filtered_data: List of timetable entries with week information

    Returns:
        List of week objects with week number, start date, and end date
    """
    days_added = {"Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4}
    week_dates = []
    seen_weeks = set()

    for data in filtered_data:
        day = data["day"]
        weeks = data["weeks"]

        for week in weeks:
            try:
                week = int(week)
            except ValueError:
                print(f"Skipping invalid week value: {week}")
                continue

            # Add a week after week 6 to account for recess week
            adjusted_week = week - 1 if week < 6 else week
            monday_date = sem_start_date + datetime.timedelta(weeks=adjusted_week)

            if week not in seen_weeks:
                seen_weeks.add(week)
                friday_date = monday_date + datetime.timedelta(days=4)
                week_dates.append(
                    {
                        "week": week,
                        "startDate": monday_date.strftime("%d %b %Y"),
                        "endDate": friday_date.strftime("%d %b %Y"),
                    }
                )

    return sorted(week_dates, key=lambda x: x["week"])


@extend_schema(
    summary="Get Academic Week Dates",
    description="Retrieve academic week dates for all semesters based on NUS academic calendar. Fetches data from NUSMods API to determine semester start dates and calculate weekly date ranges, accounting for recess weeks.",
    responses={
        200: OpenApiResponse(
            description="Academic week dates for all semesters",
            examples=[
                {
                    "value": [
                        {
                            "semester": 1,
                            "weeks": [
                                {
                                    "week": 1,
                                    "startDate": "05 Aug 2024",
                                    "endDate": "09 Aug 2024",
                                },
                                {
                                    "week": 2,
                                    "startDate": "12 Aug 2024",
                                    "endDate": "16 Aug 2024",
                                },
                                {
                                    "week": 3,
                                    "startDate": "19 Aug 2024",
                                    "endDate": "23 Aug 2024",
                                },
                                {
                                    "week": 13,
                                    "startDate": "25 Nov 2024",
                                    "endDate": "29 Nov 2024",
                                },
                            ],
                        },
                        {
                            "semester": 2,
                            "weeks": [
                                {
                                    "week": 1,
                                    "startDate": "13 Jan 2025",
                                    "endDate": "17 Jan 2025",
                                },
                                {
                                    "week": 2,
                                    "startDate": "20 Jan 2025",
                                    "endDate": "24 Jan 2025",
                                },
                            ],
                        },
                    ]
                }
            ],
        ),
        500: OpenApiResponse(
            description="Server error - Failed to fetch data or process request",
            examples=[
                {
                    "value": {
                        "error": "Failed to fetch data from NUSMods API: Connection timeout"
                    }
                },
                {
                    "value": {
                        "error": "An unexpected error occurred: Invalid date format"
                    }
                },
            ],
        ),
    },
    tags=["Academic Calendar"],
    auth=[],  # No authentication required
)
@api_view(["GET"])
@permission_classes([AllowAny])
@renderer_classes([CamelCaseJSONRenderer])
def get_academic_weeks(request):
    """
    Get academic week dates for all semesters.

    Fetches module data from the NUSMods API to determine semester structures
    and calculates the date ranges for each academic week. Accounts for recess
    weeks and provides formatted date ranges for frontend calendar integration.

    The function uses a reference module (CS1010S) to extract semester timing
    information and maps this to actual calendar dates for academic year 2024-2025.

    Returns:
        Response: List of semesters with their respective week date ranges
    """
    try:
        result = []
        reference_mod = "CS1010S"

        # Fetch module data from NUSMods API
        response = requests.get(
            f"https://api.nusmods.com/v2/2024-2025/modules/{reference_mod}.json"
        )
        response.raise_for_status()  # Raise exception for bad status codes
        module_data = response.json()

        # Define semester start dates
        sem_start_dates = {
            1: datetime.date(2024, 8, 5),
            2: datetime.date(2025, 1, 13),
            3: datetime.date(2025, 5, 12),
        }

        for semester in module_data.get("semesterData", []):
            timetable = semester.get("timetable", [])
            if not timetable:
                continue

            filtered_data = [
                {
                    "semester": semester["semester"],
                    "weeks": entry["weeks"],
                    "day": entry["day"],
                }
                for entry in timetable
            ]

            if filtered_data:
                sem_num = filtered_data[0]["semester"]
                week_dates = get_week_dates(sem_start_dates[sem_num], filtered_data)

                if week_dates:
                    result.append({"semester": sem_num, "weeks": week_dates})

        return Response(result)

    except requests.RequestException as e:
        return Response(
            {"error": f"Failed to fetch data from NUSMods API: {str(e)}"}, status=500
        )
    except Exception as e:
        return Response(
            {"error": f"An unexpected error occurred: {str(e)}"}, status=500
        )
