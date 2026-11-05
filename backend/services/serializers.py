from rest_framework import serializers

from .models import ServiceCategory

# Owner: Pruthviraj


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ["id", "name"]
