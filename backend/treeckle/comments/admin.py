from django.contrib import admin

from .models import Comment, CommentRead, BookingComment

# Register your models here.
admin.site.register(Comment)
admin.site.register(CommentRead)
admin.site.register(BookingComment)
