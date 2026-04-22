from rest_framework import serializers
from .models import Job


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ['user', 'applied_date', 'updated_at']


class JobStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Job.STATUS_CHOICES)


class ExtensionJobSerializer(serializers.Serializer):
    company = serializers.CharField(max_length=255)
    role = serializers.CharField(max_length=255)
    platform = serializers.CharField(max_length=50, default='unknown')
    job_url = serializers.URLField(max_length=500, required=False, allow_blank=True)
    location = serializers.CharField(max_length=255, required=False, allow_blank=True)
    salary = serializers.CharField(max_length=100, required=False, allow_blank=True)

class JobSyncItemSerializer(serializers.Serializer):
    company = serializers.CharField(max_length=255)
    role = serializers.CharField(max_length=255)
    status = serializers.ChoiceField(choices=Job.STATUS_CHOICES)
    platform = serializers.CharField(max_length=50, default='unknown')