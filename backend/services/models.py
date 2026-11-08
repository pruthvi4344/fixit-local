from django.core.validators import MinValueValidator
from django.db import models

# Owner: Pruthviraj


class ServiceCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "service categories"

    def __str__(self):
        return self.name


class Service(models.Model):
    """One job a provider offers, like "Fix a leaking tap" for $85."""

    # Written as a string because accounts.models already imports this file.
    provider = models.ForeignKey("accounts.ProviderProfile", on_delete=models.CASCADE, related_name="services")
    category = models.ForeignKey(ServiceCategory, on_delete=models.PROTECT, related_name="services")
    title = models.CharField(max_length=150)
    price = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(0)])
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["price"]  # cheapest first

    def __str__(self):
        return f"{self.title} (${self.price})"
