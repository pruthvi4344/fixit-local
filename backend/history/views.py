from datetime import date

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import ProviderProfile
from services.serializers import ProviderCardSerializer

# Owner: Deep


class HistoryView(APIView):
    """GET: today's visit count, recent searches and viewed providers.
    DELETE: clear the searches and viewed providers."""

    permission_classes = [AllowAny]  # guests have a history too

    def get(self, request):
        visits = request.session.get("visits_today", {})
        visit_count = visits.get("count", 0) if visits.get("date") == date.today().isoformat() else 0

        viewed_ids = request.session.get("viewed_providers", [])
        providers = ProviderProfile.objects.filter(
            pk__in=viewed_ids, status=ProviderProfile.Status.VERIFIED
        ).prefetch_related("categories", "services__category")
        by_id = {p.pk: p for p in providers}
        ordered = [by_id[i] for i in viewed_ids if i in by_id]  # newest first

        return Response({
            "visits_today": visit_count,
            "searches": request.session.get("searches", []),
            "viewed_providers": ProviderCardSerializer(ordered, many=True, context={"request": request}).data,
        })

    def delete(self, request):
        request.session.pop("searches", None)
        request.session.pop("viewed_providers", None)
        return Response(status=204)


class VisitView(APIView):
    """Called once when the site opens; the middleware does the counting."""

    permission_classes = [AllowAny]

    def get(self, request):
        return Response(status=204)