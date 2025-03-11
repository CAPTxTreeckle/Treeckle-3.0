from django.db import models
from treeckle.common.models import TimestampedModel


# Create your models here.
class Organization(TimestampedModel):
    name = models.CharField(max_length=255, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
