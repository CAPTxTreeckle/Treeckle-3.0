from django.db import models
from django.db.models.signals import post_delete

from treeckle.common.models import TimestampedModel
from organizations.models import Organization

from .logic.image import image_cleanup

# Create your models here.
class Image(TimestampedModel):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    image_url = models.URLField(max_length=500)
    image_id = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return (
            self.image_url
            if not self.image_id
            else f"{self.image_url} | {self.image_id}"
        )

    @classmethod
    def create(cls, organization: Organization, image: str) -> "Image":
        return cls.objects.create(organization=organization, image_url=image)


post_delete.connect(
    image_cleanup,
    sender=Image,
    dispatch_uid="content_delivery_service.image.image_cleanup",
)
