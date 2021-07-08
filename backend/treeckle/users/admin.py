from django.contrib import admin

from .models import User, UserInvite

# Register your models here.
admin.site.register(User)
admin.site.register(UserInvite)
