from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import ProviderProfile

from .models import Booking, TimeSlot
from .serializers import BookingSerializer, TimeSlotSerializer

# Owner: Devarsh


def future_slots():
    """Slots that haven't started yet."""
    now = timezone.localtime()
    return TimeSlot.objects.filter(Q(date__gt=now.date()) | Q(date=now.date(), start_time__gt=now.time()))


class IsProvider(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, "provider_profile")


class IsCustomer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and not hasattr(request.user, "provider_profile")


class ProviderFreeSlotsView(generics.ListAPIView):
    """Public: the free upcoming slots shown on a verified provider's profile."""

    serializer_class = TimeSlotSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return future_slots().filter(
            provider_id=self.kwargs["pk"], provider__status=ProviderProfile.Status.VERIFIED, is_booked=False
        )


class MySlotsView(generics.ListCreateAPIView):
    """A provider's own slots (dashboard): list them and add new ones."""

    serializer_class = TimeSlotSerializer
    permission_classes = [IsProvider]

    def get_queryset(self):
        # Hide slots from past days.
        return TimeSlot.objects.filter(
            provider=self.request.user.provider_profile, date__gte=timezone.localdate()
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.request.user.is_authenticated and hasattr(self.request.user, "provider_profile"):
            context["provider"] = self.request.user.provider_profile
        return context

    def perform_create(self, serializer):
        serializer.save(provider=self.request.user.provider_profile)


class MySlotDetailView(generics.DestroyAPIView):
    permission_classes = [IsProvider]

    def get_queryset(self):
        return TimeSlot.objects.filter(provider=self.request.user.provider_profile)

    def perform_destroy(self, instance):
        if instance.is_booked:
            raise PermissionDenied("This slot is already booked and can't be removed.")
        instance.delete()


class BookingCreateView(APIView):
    """A customer books a free slot: creates a Pending booking and marks the slot taken."""

    permission_classes = [IsCustomer]

    def post(self, request):
        slot_id = request.data.get("slot")
        if not slot_id:
            return Response({"slot": ["Choose a time slot."]}, status=status.HTTP_400_BAD_REQUEST)
        try:
            slot_id = int(slot_id)
        except (TypeError, ValueError):
            return Response({"slot": ["Invalid slot."]}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # Locking the row stops two customers booking the same slot at once.
            slot = (
                TimeSlot.objects.select_for_update()
                .filter(pk=slot_id, provider__status=ProviderProfile.Status.VERIFIED)
                .first()
            )
            if slot is None:
                return Response({"detail": "That slot doesn't exist."}, status=status.HTTP_404_NOT_FOUND)
            if slot.is_booked:
                return Response({"detail": "Sorry, that slot was just taken."}, status=status.HTTP_409_CONFLICT)
            if not future_slots().filter(pk=slot.pk).exists():
                return Response({"detail": "That time has already passed."}, status=status.HTTP_400_BAD_REQUEST)
            booking = Booking.objects.create(customer=request.user, slot=slot)
            slot.is_booked = True
            slot.save(update_fields=["is_booked"])

        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)


class MyBookingsView(generics.ListAPIView):
    """The customer's My Bookings page."""

    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(customer=self.request.user).select_related("slot__provider", "customer")


class IncomingBookingsView(generics.ListAPIView):
    """Bookings made on the logged-in provider's slots (dashboard)."""

    serializer_class = BookingSerializer
    permission_classes = [IsProvider]

    def get_queryset(self):
        return Booking.objects.filter(slot__provider=self.request.user.provider_profile).select_related(
            "slot__provider", "customer"
        )


class AcceptBookingView(APIView):
    permission_classes = [IsProvider]

    def post(self, request, pk):
        booking = get_object_or_404(
            Booking.objects.select_related("slot__provider", "customer"),
            pk=pk,
            slot__provider=request.user.provider_profile,
        )
        booking.status = Booking.Status.ACCEPTED
        booking.save(update_fields=["status"])
        return Response(BookingSerializer(booking).data)
