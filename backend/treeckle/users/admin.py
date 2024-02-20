from django.contrib import admin

from .models import User, UserInvite

# Register your models here.
class UserAdmin(admin.ModelAdmin):
    search_fields = ['name__icontains', 'email__icontains', 'organization__name__icontains', 'role__icontains']
    
admin.site.register(User, UserAdmin)

class UserInviteAdmin(admin.ModelAdmin):
    search_fields = ['email__icontains', 'organization__name__icontains', 'role__icontains']

admin.site.register(UserInvite,UserInviteAdmin)
