from rest_framework import serializers
from .models import Comment


class PostCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ["content"]
