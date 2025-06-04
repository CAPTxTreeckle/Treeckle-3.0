from rest_framework.decorators import api_view, renderer_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from djangorestframework_camel_case.render import CamelCaseJSONRenderer

import requests
import datetime
import json


def get_week_dates(sem_start_date, filtered_data):
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


@api_view(["GET"])
@permission_classes([AllowAny])
@renderer_classes([CamelCaseJSONRenderer])
def get_academic_weeks(request):
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
