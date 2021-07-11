from rest_framework import serializers
from .models import Comment


class PostCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ["content"]

class PostReadCommentSerializer(serializers.Serializer):
    comment_ids = serializers.ListField(
        child = serializers.IntegerField()
    )