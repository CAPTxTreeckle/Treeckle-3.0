from rest_framework.exceptions import NotFound, PermissionDenied

from treeckle.common.exceptions import BadRequest
from users.models import User
from .models import Comment
from .logic import get_comments


def check_requester_is_commenter(view_method):
    def _arguments_wrapper(
        instance, request, requester: User, comment_id: int, *args, **kwargs
    ):
        try:
            comment = get_comments(id=comment_id).select_related("commenter").get()
            is_commenter = requester == comment.commenter

            if not is_commenter:
                raise PermissionDenied(
                    detail="No permission to access comment.",
                    code="no_access_comment_permission",
                )

        except (
            Comment.DoesNotExist,
            Comment.MultipleObjectsReturned,
            PermissionDenied,
        ) as e:
            raise NotFound(detail="No comment found.", code="no_comment_found")

        return view_method(
            instance, request, requester=requester, comment=comment, *args, **kwargs
        )

    return _arguments_wrapper

def check_comment_is_active(view_method):
    def _arguments_wrapper(
        instance, request, requester: User, comment: Comment, *args, **kwargs
    ):
        if not comment.is_active:
            raise BadRequest("Comment has already been deleted.")
    
        return view_method(
            instance, request, requester=requester, comment=comment, *args, **kwargs
        )
    
    return _arguments_wrapper
