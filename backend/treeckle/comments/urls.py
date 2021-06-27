from django.urls import path

from .views import SingleCommentView

urlpatterns = [
    path(
        "<int:comment_id>",
        SingleCommentView.as_view(),
        name="comments",
    ),
]
