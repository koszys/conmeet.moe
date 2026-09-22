from conventions.models import Convention
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Freebie, UserFreebie, Vendor
from .serializers import FreebieCreateSerializer, FreebieSerializer, VendorSerializer


class FreebieListCreateView(generics.ListCreateAPIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return FreebieCreateSerializer
        return FreebieSerializer

    def get_queryset(self):
        qs = (
            Freebie.objects.select_related("vendor", "convention", "created_by")
            .annotate(_save_count=Count("saved_by"))
            .order_by("-created_at")
        )

        convention_param = self.request.query_params.get("convention")
        if convention_param:
            if convention_param.isdigit():
                qs = qs.filter(Q(convention_id=int(convention_param)) | Q(convention__slug=convention_param))
            else:
                qs = qs.filter(convention__slug=convention_param)

        vendor_param = self.request.query_params.get("vendor")
        if vendor_param and vendor_param.isdigit():
            qs = qs.filter(vendor_id=int(vendor_param))

        q_param = self.request.query_params.get("q")
        if q_param:
            query = q_param.strip()
            qs = qs.filter(
                Q(name__icontains=query)
                | Q(description__icontains=query)
                | Q(requirements__icontains=query)
                | Q(location__icontains=query)
                | Q(vendor__name__icontains=query)
            )

        saved_param = self.request.query_params.get("saved")
        unclaimed_param = self.request.query_params.get("unclaimed")
        claimed_param = self.request.query_params.get("claimed")

        if saved_param == "true" or unclaimed_param == "true" or claimed_param == "true":
            user = self.request.user
            if not user.is_authenticated:
                return qs.none()

            user_saved_ids = UserFreebie.objects.filter(user=user)
            if unclaimed_param == "true":
                user_saved_ids = user_saved_ids.filter(claimed=False)
            elif claimed_param == "true":
                user_saved_ids = user_saved_ids.filter(claimed=True)
            qs = qs.filter(id__in=user_saved_ids.values_list("freebie_id", flat=True))

        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        user = self.request.user
        if user.is_authenticated:
            page = getattr(self, "_paginator_page", None)
            freebie_ids = [f.id for f in (page if page is not None else self.get_queryset())]
            user_freebies = UserFreebie.objects.filter(user=user, freebie_id__in=freebie_ids)
            context["user_freebies_map"] = {uf.freebie_id: uf for uf in user_freebies}
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        freebie = serializer.save()

        out_serializer = FreebieSerializer(freebie, context=self.get_serializer_context())
        return Response(out_serializer.data, status=status.HTTP_201_CREATED)


class FreebieDetailView(generics.RetrieveAPIView):
    serializer_class = FreebieSerializer
    queryset = Freebie.objects.select_related("vendor", "convention", "created_by").annotate(
        _save_count=Count("saved_by")
    )


class FreebieSaveToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk: int):
        freebie = get_object_or_404(Freebie, pk=pk)
        user_freebie = UserFreebie.objects.filter(user=request.user, freebie=freebie).first()

        if user_freebie:
            user_freebie.delete()
            is_saved = False
        else:
            UserFreebie.objects.create(user=request.user, freebie=freebie, claimed=False)
            is_saved = True

        save_count = freebie.saved_by.count()
        return Response({"is_saved": is_saved, "save_count": save_count}, status=status.HTTP_200_OK)


class FreebieClaimToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk: int):
        freebie = get_object_or_404(Freebie, pk=pk)
        user_freebie, _ = UserFreebie.objects.get_or_create(
            user=request.user, freebie=freebie, defaults={"claimed": False}
        )

        user_freebie.claimed = not user_freebie.claimed
        if user_freebie.claimed:
            user_freebie.claimed_at = timezone.now()
        else:
            user_freebie.claimed_at = None
        user_freebie.save(update_fields=["claimed", "claimed_at"])

        return Response(
            {
                "is_claimed": user_freebie.claimed,
                "claimed_at": user_freebie.claimed_at.isoformat() if user_freebie.claimed_at else None,
            },
            status=status.HTTP_200_OK,
        )


class VendorListView(generics.ListAPIView):
    serializer_class = VendorSerializer

    def get_queryset(self):
        qs = Vendor.objects.all().order_by("name")

        convention_param = self.request.query_params.get("convention")
        if convention_param:
            if convention_param.isdigit():
                qs = qs.filter(
                    Q(freebies__convention_id=int(convention_param))
                    | Q(freebies__convention__slug=convention_param)
                ).distinct()
            else:
                qs = qs.filter(freebies__convention__slug=convention_param).distinct()

        q_param = self.request.query_params.get("q")
        if q_param:
            qs = qs.filter(Q(name__icontains=q_param.strip()) | Q(description__icontains=q_param.strip()))

        return qs
