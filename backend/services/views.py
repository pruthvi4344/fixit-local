from rest_framework import generics

from .models import ServiceCategory
from .serializers import ServiceCategorySerializer

# Owner: Pruthviraj


class CategoryListView(generics.ListAPIView):
    """Fills the category drop-downs in search and the provider form."""

    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer
