from django.db import models

class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def update_from_dict(self, update_dict, commit=True):
        for field, value in update_dict.items():
            setattr(self, field, value)
        
        if commit:
            self.save()