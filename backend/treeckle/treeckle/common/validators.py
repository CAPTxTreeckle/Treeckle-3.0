from django.core.validators import URLValidator
from django.core.exceptions import ValidationError

validate_url = URLValidator()


def is_url(url: str) -> bool:
    try:
        validate_url(url)
        return True
    except ValidationError:
        return False