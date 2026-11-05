from django.conf import settings
from django.contrib.auth.models import User
from django.core.files.storage import FileSystemStorage
from django.core.validators import FileExtensionValidator
from django.db import models

from services.models import ServiceCategory

# Owner: Haris

document_type_validator = FileExtensionValidator(["pdf", "jpg", "jpeg", "png"])


def private_storage():
    # ID documents are kept outside media/ so nobody can open them by URL.
    return FileSystemStorage(location=settings.PRIVATE_MEDIA_ROOT)


class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="customer_profile")
    phone = models.CharField(max_length=20)

    def __str__(self):
        return self.user.email


class ProviderProfile(models.Model):
    class Status(models.TextChoices):
        INCOMPLETE = "incomplete", "Incomplete"  # just registered, form not sent yet
        PENDING = "pending", "Pending"  # form sent, waiting for the admin
        VERIFIED = "verified", "Verified"  # approved, shows up in search
        REJECTED = "rejected", "Rejected"  # provider can fix it and send it again

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="provider_profile")
    phone = models.CharField(max_length=20)

    # These stay empty until the provider fills in the verification form.
    business_name = models.CharField(max_length=150, blank=True)
    categories = models.ManyToManyField(ServiceCategory, blank=True, related_name="providers")
    service_area = models.CharField(max_length=150, blank=True)
    years_experience = models.PositiveSmallIntegerField(null=True, blank=True)
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to="provider_photos/", blank=True)
    id_document = models.FileField(
        upload_to="id_documents/",
        storage=private_storage,
        blank=True,
        validators=[document_type_validator],
    )

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.INCOMPLETE)
    rejection_reason = models.TextField(blank=True)

    def __str__(self):
        return self.business_name or self.user.email

    @property
    def is_verified(self):
        return self.status == self.Status.VERIFIED

    @property
    def can_submit(self):
        # Pending and verified profiles are locked while the admin has them.
        return self.status in (self.Status.INCOMPLETE, self.Status.REJECTED)
