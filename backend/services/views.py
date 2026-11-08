from django.db.models import Q
from django.http import JsonResponse
from django.views.generic import DetailView, ListView
from rest_framework import generics

from accounts.models import ProviderProfile
from history.utils import remember_search, remember_viewed_provider

from .models import ServiceCategory, Service
from .serializers import ProviderCardSerializer, ProviderDetailSerializer, ServiceCategorySerializer, ServiceSerializer

from rest_framework import generics, permissions


def verified_providers():
    # Customers must only ever see providers the admin has approved.
    # prefetch_related loads the categories and services in a few queries
    # instead of asking the database again for every single card.
    return ProviderProfile.objects.filter(status=ProviderProfile.Status.VERIFIED).prefetch_related(
        "categories", "services__category"
    )


class CategoryListView(generics.ListAPIView):
    """Fills the category filters on the services page and the provider form."""

    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer


class ProviderListView(ListView):
    """The services page: all verified providers, with optional search."""

    def get_queryset(self):
        providers = verified_providers()

        # ?q=leak looks through names, bios, areas, categories and services.
        keyword = self.request.GET.get("q", "").strip()
        if keyword:
            providers = providers.filter(
                Q(business_name__icontains=keyword)
                | Q(bio__icontains=keyword)
                | Q(service_area__icontains=keyword)
                | Q(categories__name__icontains=keyword)
                | Q(services__title__icontains=keyword)
            )

        # ?category=Plumbing keeps only that category.
        category = self.request.GET.get("category", "").strip()
        if category:
            providers = providers.filter(categories__name__iexact=category)

                # Remember this search for the "My History" page (Deep).
        if keyword or category:
            remember_search(self.request, keyword, category)
        # distinct() because a provider can match through two services.
        return providers.distinct().order_by("business_name")

    def render_to_response(self, context, **response_kwargs):
        # ListView normally renders an HTML template. React draws our pages,
        # so we send the same list back as JSON instead.
        serializer = ProviderCardSerializer(context["object_list"], many=True, context={"request": self.request})
        return JsonResponse(serializer.data, safe=False)


class ProviderDetailView(DetailView):
    """The provider profile page. Gives a 404 if they aren't verified."""

    def get_queryset(self):
        return verified_providers()

    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        # Remember which provider was viewed, for "My History" (Deep).
        remember_viewed_provider(request, self.object.pk)
        return response

    def render_to_response(self, context, **response_kwargs):
        serializer = ProviderDetailSerializer(context["object"], context={"request": self.request})
        return JsonResponse(serializer.data)

class ProviderServiceListCreateView(generics.ListCreateAPIView):
    """
    List services created by the logged-in provider, or create a new service.
    """
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return only services belonging to the logged-in user's provider profile
        return Service.objects.filter(provider__user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the provider to the logged-in user's provider profile
        serializer.save(provider=self.request.user.provider_profile)


class ProviderServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a specific service owned by the logged-in provider.
    """
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Service.objects.filter(provider__user=self.request.user)


