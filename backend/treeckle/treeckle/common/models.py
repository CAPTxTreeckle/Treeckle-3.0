from django.db import models

class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def update_from_dict(self, update_dict, commit=True):
        for field, value in update_dict.items():
            if not hasattr(self, field):
                raise ValueError(f"Field '{field}' does not exist in model '{self.__class__.__name__}'")
            
            field_instance = self._meta.get_field(field)
            if isinstance(field_instance, models.ForeignKey):
                related_model = field_instance.related_model
                if not isinstance(value, related_model):
                    value = related_model.objects.get(pk=value)
            
            setattr(self, field, value)
        
        if commit:
            self.save()