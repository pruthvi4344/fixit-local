from rest_framework import serializers

from accounts.models import ProviderProfile

from .models import Service, ServiceCategory

# Owner: Pruthviraj


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ["id", "name"]


class ServiceSerializer(serializers.ModelSerializer):
    """Read-only list on the public profile: the category shows as its name."""

    category = serializers.StringRelatedField()

    class Meta:
        model = Service
        fields = ["id", "title", "category", "price", "description"]


class ProviderServiceSerializer(serializers.ModelSerializer):
    """Used by the dashboard: the category is written as an id and read back with its name too."""

    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Service
        fields = ["id", "title", "category", "category_name", "price", "description"]


class ProviderCardSerializer(serializers.ModelSerializer):
    """What a card on the services page shows. Never add phone or documents here."""

    name = serializers.CharField(source="business_name")
    categories = serializers.StringRelatedField(many=True)
    starting_price = serializers.SerializerMethodField()

    class Meta:
        model = ProviderProfile
        fields = [
            "id", "name", "photo", "is_verified", "categories",
            "service_area", "years_experience", "bio", "starting_price",
        ]

    def get_starting_price(self, provider):
        # The cheapest service, or None if they haven't added any yet.
        return min((service.price for service in provider.services.all()), default=None)


class ProviderDetailSerializer(ProviderCardSerializer):
    """The profile page shows everything on the card, plus the services."""

    services = ServiceSerializer(many=True)

    class Meta(ProviderCardSerializer.Meta):
        fields = ProviderCardSerializer.Meta.fields + ["services"]
