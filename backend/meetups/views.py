from conventions.models import Convention
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions

from .models import Going, Meetup, SavedMeetup
from .permissions import IsAuthorOrReadOnly
from .serializers import (
    MeetupCreateSerializer,
    MeetupDetailSerializer,
    MeetupListSerializer,
    MeetupUpdateSerializer,
)


class ConventionMeetupListCreateView(generics.ListCreateAPIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return MeetupCreateSerializer
        return MeetupListSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        user = self.request.user
        if user and user.is_authenticated:
            # Pre-cache user's saved and going meetup IDs for this convention to prevent N+1 queries
            slug = self.kwargs.get("slug")
            context["saved_meetups_set"] = set(
                SavedMeetup.objects.filter(
                    user=user, meetup__convention__slug=slug
                ).values_list("meetup_id", flat=True)
            )
            context["going_meetups_set"] = set(
                Going.objects.filter(
                    user=user, meetup__convention__slug=slug
                ).values_list("meetup_id", flat=True)
            )
        return context

    def get_queryset(self):
        slug = self.kwargs.get("slug")
        convention = get_object_or_404(Convention, slug=slug)

        qs = (
            Meetup.objects.filter(convention=convention)
            .select_related("convention", "created_by")
            .annotate(_going_count=Count("going", distinct=True))
            .order_by("starts_at", "name")
        )

        date_param = self.request.query_params.get("date")
        if date_param:
            qs = qs.filter(starts_at__date=date_param)

        official_param = self.request.query_params.get("official")
        if official_param is not None:
            if official_param.lower() in ("true", "1"):
                qs = qs.filter(is_official=True)
            elif official_param.lower() in ("false", "0"):
                qs = qs.filter(is_official=False)

        q_param = self.request.query_params.get("q")
        if q_param:
            query = q_param.strip()
            qs = qs.filter(
                Q(name__icontains=query)
                | Q(location__icontains=query)
                | Q(description__icontains=query)
            )

        saved_param = self.request.query_params.get("saved")
        user = self.request.user
        if saved_param and saved_param.lower() in ("true", "1") and user.is_authenticated:
            saved_ids = SavedMeetup.objects.filter(
                user=user, meetup__convention=convention
            ).values_list("meetup_id", flat=True)
            qs = qs.filter(id__in=saved_ids)

        return qs

    def perform_create(self, serializer):
        slug = self.kwargs.get("slug")
        convention = get_object_or_404(Convention, slug=slug)
        serializer.save(convention=convention, created_by=self.request.user)


class MeetupDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthorOrReadOnly]
    queryset = (
        Meetup.objects.select_related("convention", "created_by")
        .annotate(_going_count=Count("going", distinct=True))
    )

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return MeetupUpdateSerializer
        return MeetupDetailSerializer
