from rest_framework import serializers
from .models import Job, Interview


class JobSerializer(serializers.ModelSerializer):
    """Original serializer for extension compatibility."""
    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ['user', 'applied_date', 'updated_at']


class ApplicationSerializer(serializers.ModelSerializer):
    """Frontend-compatible serializer — maps field names to camelCase."""
    position = serializers.CharField(source='role')
    appliedDate = serializers.DateTimeField(source='applied_date', read_only=True)
    lastUpdate = serializers.DateTimeField(source='updated_at', read_only=True)
    jobUrl = serializers.URLField(source='job_url', required=False, allow_blank=True, allow_null=True)
    contactPerson = serializers.CharField(source='contact_person', required=False, allow_blank=True, allow_null=True)
    contactEmail = serializers.EmailField(source='contact_email', required=False, allow_blank=True, allow_null=True)
    followUp = serializers.BooleanField(source='follow_up', required=False, default=False)

    class Meta:
        model = Job
        fields = [
            'id', 'company', 'position', 'status', 'location', 'salary',
            'appliedDate', 'lastUpdate', 'notes', 'contactPerson',
            'contactEmail', 'jobUrl', 'followUp'
        ]
        read_only_fields = ['id', 'appliedDate', 'lastUpdate']

    def validate_status(self, value):
        """Accept both frontend and legacy status values."""
        status_map = {
            'interviewing': 'interviewing',
            'interview': 'interviewing',
            'offered': 'offered',
            'offer': 'offered',
            'applied': 'applied',
            'rejected': 'rejected',
            'accepted': 'accepted',
            'viewed': 'viewed',
            'withdrawn': 'withdrawn',
        }
        return status_map.get(value, value)


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


class InterviewSerializer(serializers.ModelSerializer):
    """Serializer for upcoming interviews."""
    company = serializers.CharField(source='job.company', read_only=True)
    position = serializers.CharField(source='job.role', read_only=True)
    scheduledDate = serializers.DateTimeField(source='scheduled_date')
    meetingLink = serializers.URLField(source='meeting_link', required=False, allow_blank=True, allow_null=True)
    meetingPlatform = serializers.CharField(source='meeting_platform', required=False, allow_blank=True)
    interviewerName = serializers.CharField(source='interviewer_name', required=False, allow_blank=True)
    interviewerEmail = serializers.EmailField(source='interviewer_email', required=False, allow_blank=True)
    isCompleted = serializers.BooleanField(source='is_completed', required=False)

    class Meta:
        model = Interview
        fields = [
            'id', 'company', 'position', 'scheduledDate', 'meetingLink',
            'meetingPlatform', 'interviewerName', 'interviewerEmail',
            'notes', 'isCompleted'
        ]
        read_only_fields = ['id', 'company', 'position']