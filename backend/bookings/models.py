from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

# Owner: Devarsh


class TimeSlot(models.Model):
    """A date and time a provider is free to take a job."""

    provider = models.ForeignKey("accounts.ProviderProfile", on_delete=models.CASCADE, related_name="time_slots")
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_booked = models.BooleanField(default=False)  # True once a customer has booked it

    class Meta:
        ordering = ["date", "start_time"]
        constraints = [
            models.UniqueConstraint(fields=["provider", "date", "start_time"], name="unique_provider_slot_start"),
        ]

    def __str__(self):
        return f"{self.provider} {self.date} {self.start_time:%H:%M}-{self.end_time:%H:%M}"

    def clean(self):
        if self.start_time and self.end_time and self.end_time <= self.start_time:
            raise ValidationError("The end time must be after the start time.")


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings")
    # One slot can only ever have one booking.
    slot = models.OneToOneField(TimeSlot, on_delete=models.CASCADE, related_name="booking")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["slot__date", "slot__start_time"]

    def __str__(self):
        return f"{self.customer} -> {self.slot} ({self.status})"
