from rest_framework.generics import ListAPIView, RetrieveAPIView

from .models import Convention
from .serializers import ConventionDetailSerializer, ConventionListSerializer


class ConventionListView(ListAPIView):
    queryset = Convention.objects.filter(is_active=True).order_by("starts_at")
    serializer_class = ConventionListSerializer


class ConventionDetailView(RetrieveAPIView):
    queryset = Convention.objects.filter(is_active=True)
    serializer_class = ConventionDetailSerializer
    lookup_field = "slug"
