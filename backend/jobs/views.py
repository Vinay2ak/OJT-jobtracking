from django.db import models
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Job
from .serializers import JobSerializer, JobStatusUpdateSerializer, ExtensionJobSerializer, JobSyncItemSerializer
from .utils import notify_user
import logging

logger = logging.getLogger(__name__)


class JobView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        jobs = Job.objects.filter(user=request.user)

        # Filtering
        status_filter = request.query_params.get('status')
        platform_filter = request.query_params.get('platform')
        search = request.query_params.get('search')

        if status_filter:
            jobs = jobs.filter(status=status_filter)
        if platform_filter:
            jobs = jobs.filter(platform=platform_filter)
        if search:
            jobs = jobs.filter(
                models.Q(company__icontains=search) |
                models.Q(role__icontains=search)
            )

        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = JobSerializer(data=request.data)
        if serializer.is_valid():
            job = serializer.save(user=request.user, source='manual')

            # Notify via WebSocket
            notify_user(request.user.id, "job_added", {
                "job": JobSerializer(job).data
            })

            return Response(JobSerializer(job).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class JobDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Job.objects.get(pk=pk, user=user)
        except Job.DoesNotExist:
            return None

    def get(self, request, pk):
        job = self.get_object(pk, request.user)
        if not job:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(JobSerializer(job).data)

    def put(self, request, pk):
        job = self.get_object(pk, request.user)
        if not job:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = JobSerializer(job, data=request.data, partial=True)
        if serializer.is_valid():
            job = serializer.save()
            notify_user(request.user.id, "job_updated", {
                "job": JobSerializer(job).data
            })
            return Response(JobSerializer(job).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        job = self.get_object(pk, request.user)
        if not job:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

        job_id = job.id
        job.delete()
        notify_user(request.user.id, "job_deleted", {"job_id": job_id})
        return Response({"message": "Job deleted"}, status=status.HTTP_204_NO_CONTENT)


class JobStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            job = Job.objects.get(pk=pk, user=request.user)
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = JobStatusUpdateSerializer(data=request.data)
        if serializer.is_valid():
            job.status = serializer.validated_data['status']
            job.save()

            notify_user(request.user.id, "job_updated", {
                "job": JobSerializer(job).data
            })

            return Response(JobSerializer(job).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        jobs = Job.objects.filter(user=request.user)

        total = jobs.count()
        applied = jobs.filter(status='applied').count()
        interview = jobs.filter(status='interview').count()
        offer = jobs.filter(status='offer').count()
        rejected = jobs.filter(status='rejected').count()
        viewed = jobs.filter(status='viewed').count()
        withdrawn = jobs.filter(status='withdrawn').count()

        # Platform breakdown
        platform_stats = {}
        for platform_choice in ['linkedin', 'naukri', 'indeed', 'manual', 'unknown']:
            count = jobs.filter(platform=platform_choice).count()
            if count > 0:
                platform_stats[platform_choice] = count

        # Source breakdown
        extension_count = jobs.filter(source='extension').count()
        manual_count = jobs.filter(source='manual').count()

        # Recent jobs (last 10)
        recent_jobs = jobs[:10]
        serializer = JobSerializer(recent_jobs, many=True)

        return Response({
            "stats": {
                "total": total,
                "applied": applied,
                "interview": interview,
                "offer": offer,
                "rejected": rejected,
                "viewed": viewed,
                "withdrawn": withdrawn,
            },
            "platform_stats": platform_stats,
            "source_stats": {
                "extension": extension_count,
                "manual": manual_count,
            },
            "recent_jobs": serializer.data,
            "all_jobs": JobSerializer(jobs, many=True).data,
        })


class ExtensionJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ExtensionJobSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        # Prevent duplicate tracking (same company + role for the same user)
        from django.utils import timezone
        from datetime import timedelta
        five_min_ago = timezone.now() - timedelta(minutes=5)

        existing = Job.objects.filter(
            user=request.user,
            company=data['company'],
            role=data['role'],
            applied_date__gte=five_min_ago
        ).first()

        if existing:
            return Response({
                "message": "Job already tracked",
                "job_id": existing.id,
                "duplicate": True
            })

        job = Job.objects.create(
            user=request.user,
            company=data['company'],
            role=data['role'],
            platform=data.get('platform', 'unknown'),
            job_url=data.get('job_url', ''),
            location=data.get('location', ''),
            salary=data.get('salary', ''),
            status='applied',
            source='extension'
        )

        job_data = JobSerializer(job).data

        # Notify via WebSocket
        notify_user(request.user.id, "job_added", {"job": job_data})

        return Response({
            "message": "Job tracked successfully",
            "job_id": job.id,
            "job": job_data
        }, status=status.HTTP_201_CREATED)


class ExtensionSyncJobsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        jobs_data = request.data.get('jobs', [])
        if not isinstance(jobs_data, list):
            return Response({"error": "Expected a list of jobs under the 'jobs' key."}, status=status.HTTP_400_BAD_REQUEST)

        updated_count = 0
        updated_jobs = []

        for data in jobs_data:
            serializer = JobSyncItemSerializer(data=data)
            if serializer.is_valid():
                validated = serializer.validated_data

                # More precise matching: exact company + role contains match
                job = Job.objects.filter(
                    user=request.user,
                    company__iexact=validated['company'],
                    role__icontains=validated['role'][:30]  # Use first 30 chars, not 10
                ).order_by('-applied_date').first()

                # Fallback: try looser match if exact didn't work
                if not job:
                    job = Job.objects.filter(
                        user=request.user,
                        company__icontains=validated['company'],
                        role__icontains=validated['role'][:15]
                    ).order_by('-applied_date').first()

                if job and job.status != validated['status']:
                    job.status = validated['status']
                    job.save()
                    updated_count += 1
                    job_serialized = JobSerializer(job).data
                    updated_jobs.append(job_serialized)
                    
                    # Notify frontend
                    notify_user(request.user.id, "job_updated", {
                        "job": job_serialized
                    })

        return Response({
            "message": f"Successfully synced {updated_count} jobs.",
            "updated_count": updated_count,
            "updated_jobs": updated_jobs
        })


class GmailSyncView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from .gmail_sync import sync_jobs_with_gmail
        try:
            count, updated_jobs = sync_jobs_with_gmail(request.user)
            return Response({
                "message": f"Successfully synced {count} jobs from Gmail.",
                "updated_count": count,
                "updated_jobs": updated_jobs
            })
        except Exception as e:
            logger.error(f"Gmail sync failed for user {request.user.email}: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)