from django.utils import timezone
from rest_framework import serializers

from .models import Booking, TimeSlot

# Owner: Devarsh


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ["id", "date", "start_time", "end_time", "is_booked"]
        read_only_fields = ["is_booked"]

    def validate_date(self, value):
        if value < timezone.localdate():
            raise serializers.ValidationError("Pick a date that is today or later.")
        return value

    def validate(self, data):
        if data["end_time"] <= data["start_time"]:
            raise serializers.ValidationError({"end_time": "The end time must be after the start time."})
        provider = self.context.get("provider")
        if provider and TimeSlot.objects.filter(provider=provider, date=data["date"], start_time=data["start_time"]).exists():
            raise serializers.ValidationError({"start_time": "You already have a slot starting at this time."})
        return data


class BookingSerializer(serializers.ModelSerializer):
    """Used for both the customer's list and the provider's incoming list."""

    slot_id = serializers.IntegerField(source="slot.id", read_only=True)
    date = serializers.DateField(source="slot.date", read_only=True)
    start_time = serializers.TimeField(source="slot.start_time", read_only=True)
    end_time = serializers.TimeField(source="slot.end_time", read_only=True)
    provider_id = serializers.IntegerField(source="slot.provider.id", read_only=True)
    provider_name = serializers.CharField(source="slot.provider.business_name", read_only=True)
    customer_name = serializers.SerializerMethodField()
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id", "status", "status_label", "created_at", "slot_id", "date", "start_time", "end_time",
            "provider_id", "provider_name", "customer_name",
        ]

    def get_customer_name(self, booking):
        return booking.customer.first_name or booking.customer.username
