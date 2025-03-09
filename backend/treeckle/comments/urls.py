from django.urls import path

from .views import SingleCommentView, ReadCommentsView

urlpatterns = [
    path(
        "<int:comment_id>",
        SingleCommentView.as_view(),
        name="comments",
    ),
    path("read", ReadCommentsView.as_view(), name="read_comments"),
]
