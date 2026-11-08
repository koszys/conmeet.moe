from conventions.models import Convention
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

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
            .annotate(
                _going_count=Count("going", distinct=True),
                _save_count=Count("saved_by", distinct=True),
            )
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
        .annotate(
            _going_count=Count("going", distinct=True),
            _save_count=Count("saved_by", distinct=True),
        )
    )

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return MeetupUpdateSerializer
        return MeetupDetailSerializer


class MeetupSaveToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk: int):
        meetup = get_object_or_404(Meetup, pk=pk)
        saved_obj = SavedMeetup.objects.filter(user=request.user, meetup=meetup).first()

        if saved_obj:
            saved_obj.delete()
            is_saved = False
        else:
            SavedMeetup.objects.create(user=request.user, meetup=meetup)
            is_saved = True

        save_count = meetup.saved_by.count()
        return Response(
            {"is_saved": is_saved, "save_count": save_count},
            status=status.HTTP_200_OK,
        )


class MeetupGoingToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk: int):
        meetup = get_object_or_404(Meetup, pk=pk)
        going_obj = Going.objects.filter(user=request.user, meetup=meetup).first()

        if going_obj:
            going_obj.delete()
            is_going = False
        else:
            Going.objects.create(user=request.user, meetup=meetup)
            is_going = True

        going_count = meetup.going.count()
        return Response(
            {"is_going": is_going, "going_count": going_count},
            status=status.HTTP_200_OK,
        )
