from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny

from .models import Convention, ConventionRequest
from .serializers import (
    ConventionDetailSerializer,
    ConventionListSerializer,
    ConventionRequestCreateSerializer,
)


class ConventionListView(ListAPIView):
    queryset = Convention.objects.filter(is_active=True).order_by("starts_at")
    serializer_class = ConventionListSerializer


class ConventionDetailView(RetrieveAPIView):
    queryset = Convention.objects.filter(is_active=True)
    serializer_class = ConventionDetailSerializer
    lookup_field = "slug"


class ConventionRequestCreateView(CreateAPIView):
    queryset = ConventionRequest.objects.all()
    serializer_class = ConventionRequestCreateSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(submitted_by=user)
