from typing import Optional
from datetime import datetime

from django.utils.timezone import make_aware


def parse_datetime_to_ms_timestamp(date_time: Optional[datetime]) -> Optional[int]:
    return round(date_time.timestamp() * 1000) if date_time is not None else None


def parse_ms_timestamp_to_datetime(ms_timestamp: Optional[int]) -> Optional[datetime]:
    return (
        make_aware(datetime.fromtimestamp(ms_timestamp / 1000))
        if ms_timestamp is not None
        else None
    )
