from datetime import datetime

from django.utils.timezone import make_aware


def parse_datetime_to_ms_timestamp(date: datetime) -> int:
    return round(date.timestamp() * 1000)


def parse_ms_timestamp_to_datetime(ms_timestamp: int) -> datetime:
    return make_aware(datetime.fromtimestamp(ms_timestamp / 1000))