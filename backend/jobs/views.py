from django.db import models
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from .models import Job, Interview, EmailScanLog
from .serializers import (
    JobSerializer, ApplicationSerializer, JobStatusUpdateSerializer,
    ExtensionJobSerializer, JobSyncItemSerializer, InterviewSerializer
)
from .utils import notify_user
import logging

logger = logging.getLogger(__name__)


# ============================================================
# FRONTEND ENDPOINTS (/applications) — Used by React dashboard
# ============================================================

class ApplicationListView(APIView):
    """GET /applications — List user's jobs in frontend format.
       POST /applications — Create a new job application."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        jobs = Job.objects.filter(user=request.user)

        # Filtering
        status_filter = request.query_params.get('status')
        search = request.query_params.get('search')

        if status_filter and status_filter != 'all':
            jobs = jobs.filter(status=status_filter)
        if search:
            jobs = jobs.filter(
                models.Q(company__icontains=search) |
                models.Q(role__icontains=search) |
                models.Q(location__icontains=search)
            )

        serializer = ApplicationSerializer(jobs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ApplicationSerializer(data=request.data)
        if serializer.is_valid():
            job = serializer.save(user=request.user, source='manual')
            return Response(ApplicationSerializer(job).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ApplicationDetailView(APIView):
    """GET/PUT/DELETE /applications/:id — Single application CRUD."""
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Job.objects.get(pk=pk, user=user)
        except Job.DoesNotExist:
            return None

    def get(self, request, pk):
        job = self.get_object(pk, request.user)
        if not job:
            return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(ApplicationSerializer(job).data)

    def put(self, request, pk):
        job = self.get_object(pk, request.user)
        if not job:
            return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ApplicationSerializer(job, data=request.data, partial=True)
        if serializer.is_valid():
            job = serializer.save()
            return Response(ApplicationSerializer(job).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        job = self.get_object(pk, request.user)
        if not job:
            return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)
        job.delete()
        return Response({"message": "Application deleted"}, status=status.HTTP_200_OK)


# ============================================================
# DASHBOARD ENDPOINT — Used by React dashboard
# ============================================================

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        jobs = Job.objects.filter(user=request.user)

        total = jobs.count()
        applied = jobs.filter(status='applied').count()
        interviewing = jobs.filter(status__in=['interviewing', 'interview']).count()
        offered = jobs.filter(status__in=['offered', 'offer']).count()
        rejected = jobs.filter(status='rejected').count()
        accepted = jobs.filter(status='accepted').count()
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
        serializer = ApplicationSerializer(recent_jobs, many=True)

        # Upcoming interviews
        upcoming_interviews = Interview.objects.filter(
            user=request.user,
            is_completed=False,
            scheduled_date__gte=timezone.now()
        ).count()

        return Response({
            "stats": {
                "total": total,
                "applied": applied,
                "interviewing": interviewing,
                "offered": offered,
                "rejected": rejected,
                "accepted": accepted,
                "viewed": viewed,
                "withdrawn": withdrawn,
                "upcoming_interviews": upcoming_interviews,
            },
            "platform_stats": platform_stats,
            "source_stats": {
                "extension": extension_count,
                "manual": manual_count,
            },
            "recent_jobs": serializer.data,
            "all_jobs": ApplicationSerializer(jobs, many=True).data,
        })


# ============================================================
# INTERVIEW ENDPOINTS — Used by UpcomingInterviews component
# ============================================================

class InterviewListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        interviews = Interview.objects.filter(user=request.user)
        serializer = InterviewSerializer(interviews, many=True)
        return Response(serializer.data)

    def post(self, request):
        job_id = request.data.get('job_id')
        if not job_id:
            return Response({"error": "job_id required"}, status=400)
        try:
            job = Job.objects.get(pk=job_id, user=request.user)
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)

        serializer = InterviewSerializer(data=request.data)
        if serializer.is_valid():
            interview = serializer.save(job=job, user=request.user)
            # Update job status to interviewing
            if job.status in ['applied', 'viewed']:
                job.status = 'interviewing'
                job.save()
            return Response(InterviewSerializer(interview).data, status=201)
        return Response(serializer.errors, status=400)


class UpcomingInterviewsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        interviews = Interview.objects.filter(
            user=request.user,
            is_completed=False,
            scheduled_date__gte=timezone.now()
        ).select_related('job')
        serializer = InterviewSerializer(interviews, many=True)
        return Response(serializer.data)


class InterviewDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            interview = Interview.objects.get(pk=pk, user=request.user)
        except Interview.DoesNotExist:
            return Response({"error": "Interview not found"}, status=404)

        serializer = InterviewSerializer(interview, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        try:
            interview = Interview.objects.get(pk=pk, user=request.user)
        except Interview.DoesNotExist:
            return Response({"error": "Interview not found"}, status=404)
        interview.delete()
        return Response({"message": "Interview deleted"}, status=200)


# ============================================================
# EMAIL SCAN ENDPOINT — Trigger manual email scan
# ============================================================

class EmailScanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from .email_parser import scan_user_emails
        try:
            count, updates = scan_user_emails(request.user)
            return Response({
                "message": f"Scanned emails. {count} job(s) updated.",
                "updates": updates
            })
        except Exception as e:
            print(f"Email scan error for {request.user.email}: {e}", flush=True)
            return Response({"error": str(e)}, status=500)


# ============================================================
# ORIGINAL EXTENSION ENDPOINTS — Keep these untouched
# ============================================================

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


class ExtensionJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ExtensionJobSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        # Prevent duplicate tracking (same company + role for the same user)
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

                job = Job.objects.filter(
                    user=request.user,
                    company__iexact=validated['company'],
                    role__icontains=validated['role'][:30]
                ).order_by('-applied_date').first()

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