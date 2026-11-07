from django.contrib import admin

from .models import Service, ServiceCategory

admin.site.register(ServiceCategory)


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ["title", "provider", "category", "price"]
    list_filter = ["category"]
    search_fields = ["title", "provider__business_name"]
