from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ("id","type","title","body","action_url","read_at","created_at")
        read_only_fields = ("id","created_at","read_at")
