from django.urls import path
from . import views

urlpatterns = [
    path("academic-weeks/", views.get_academic_weeks, name="academic-weeks"),
]
