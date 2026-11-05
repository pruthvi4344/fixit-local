from django import forms
from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html

from .models import CustomerProfile, ProviderProfile


class ProviderProfileForm(forms.ModelForm):
    class Meta:
        model = ProviderProfile
        fields = ["status", "rejection_reason"]

    def clean(self):
        data = super().clean()
        # The provider needs to know what to fix.
        if data.get("status") == ProviderProfile.Status.REJECTED and not data.get("rejection_reason", "").strip():
            self.add_error("rejection_reason", "Please give a reason so the provider can fix it.")
        return data


@admin.register(ProviderProfile)
class ProviderProfileAdmin(admin.ModelAdmin):
    form = ProviderProfileForm
    list_display = ["__str__", "user", "phone", "service_area", "status"]
    list_filter = ["status", "categories"]
    search_fields = ["business_name", "user__email", "user__first_name"]
    actions = ["approve_providers"]

    # The admin only decides the status, the details are the provider's own.
    fields = [
        "user", "phone", "business_name", "category_names", "service_area", "years_experience",
        "bio", "photo", "id_document_link", "status", "rejection_reason",
    ]
    readonly_fields = [
        "user", "phone", "business_name", "category_names", "service_area", "years_experience",
        "bio", "photo", "id_document_link",
    ]

    def has_add_permission(self, request):
        return False  # profiles are made when someone registers

    @admin.display(description="Service categories")
    def category_names(self, profile):
        return ", ".join(category.name for category in profile.categories.all()) or "-"

    @admin.display(description="ID or licence document")
    def id_document_link(self, profile):
        if not profile.id_document:
            return "Not uploaded"
        url = reverse("provider-id-document", args=[profile.pk])
        return format_html('<a href="{}">Download document</a>', url)

    def save_model(self, request, obj, form, change):
        if obj.status != ProviderProfile.Status.REJECTED:
            obj.rejection_reason = ""
        super().save_model(request, obj, form, change)

    @admin.action(description="Approve selected pending providers")
    def approve_providers(self, request, queryset):
        count = queryset.filter(status=ProviderProfile.Status.PENDING).update(
            status=ProviderProfile.Status.VERIFIED, rejection_reason=""
        )
        self.message_user(request, f"{count} provider(s) approved.")


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "phone"]
    search_fields = ["user__email", "user__first_name"]
