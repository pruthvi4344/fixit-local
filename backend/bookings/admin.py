from django.contrib import admin

from .models import Booking, TimeSlot


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ["provider", "date", "start_time", "end_time", "is_booked"]
    list_filter = ["is_booked", "date"]


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ["customer", "slot", "status", "created_at"]
    list_filter = ["status"]
