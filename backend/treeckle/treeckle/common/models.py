from django.db import models

from django_update_from_dict import UpdateFromDictMixin


class TimestampedModel(UpdateFromDictMixin, models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True