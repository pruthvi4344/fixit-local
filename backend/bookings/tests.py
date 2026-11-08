from datetime import timedelta

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APITestCase

from accounts.models import ProviderProfile
from services.models import Service, ServiceCategory

from .models import Booking, TimeSlot

# Owner: Devarsh
PASSWORD = "Fix1t-Local-2026"


class BookingFlowTests(APITestCase):
    def setUp(self):
        self.category = ServiceCategory.objects.create(name="Plumbing")
        self.provider = self.make_provider("pro@example.com", "verified")
        self.other_provider = self.make_provider("other@example.com", "verified")
        self.unverified = self.make_provider("new@example.com", "pending")
        self.customer = User.objects.create_user("cust@example.com", password=PASSWORD, first_name="Cathy")
        self.customer2 = User.objects.create_user("cust2@example.com", password=PASSWORD)
        self.tomorrow = timezone.localdate() + timedelta(days=1)
        self.slot = TimeSlot.objects.create(
            provider=self.provider, date=self.tomorrow, start_time="09:00", end_time="10:00"
        )

    def make_provider(self, email, status):
        user = User.objects.create_user(email, password=PASSWORD)
        return ProviderProfile.objects.create(user=user, phone="1", business_name=email, status=status)

    def login(self, user):
        self.client.force_login(user)

    # --- booking -------------------------------------------------------
    def test_customer_books_a_free_slot(self):
        self.login(self.customer)
        response = self.client.post("/api/bookings/", {"slot": self.slot.id})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["status"], "pending")
        self.slot.refresh_from_db()
        self.assertTrue(self.slot.is_booked)
        self.assertEqual(Booking.objects.get().customer, self.customer)

    def test_booked_slot_cannot_be_booked_again(self):
        self.login(self.customer)
        self.client.post("/api/bookings/", {"slot": self.slot.id})
        self.login(self.customer2)
        response = self.client.post("/api/bookings/", {"slot": self.slot.id})
        self.assertEqual(response.status_code, 409)
        self.assertEqual(Booking.objects.count(), 1)

    def test_guest_cannot_book(self):
        response = self.client.post("/api/bookings/", {"slot": self.slot.id})
        self.assertIn(response.status_code, (401, 403))
        self.assertEqual(Booking.objects.count(), 0)

    def test_provider_cannot_book(self):
        self.login(self.other_provider.user)
        response = self.client.post("/api/bookings/", {"slot": self.slot.id})
        self.assertEqual(response.status_code, 403)

    def test_cannot_book_unverified_provider_or_past_slot(self):
        hidden = TimeSlot.objects.create(
            provider=self.unverified, date=self.tomorrow, start_time="09:00", end_time="10:00"
        )
        past = TimeSlot.objects.create(
            provider=self.provider, date=timezone.localdate() - timedelta(days=1), start_time="09:00", end_time="10:00"
        )
        self.login(self.customer)
        self.assertEqual(self.client.post("/api/bookings/", {"slot": hidden.id}).status_code, 404)
        self.assertEqual(self.client.post("/api/bookings/", {"slot": past.id}).status_code, 400)
        self.assertEqual(self.client.post("/api/bookings/", {}).status_code, 400)

    # --- public free slots --------------------------------------------
    def test_profile_lists_only_free_future_slots(self):
        TimeSlot.objects.create(
            provider=self.provider, date=self.tomorrow, start_time="11:00", end_time="12:00", is_booked=True
        )
        TimeSlot.objects.create(
            provider=self.provider, date=timezone.localdate() - timedelta(days=1), start_time="09:00", end_time="10:00"
        )
        response = self.client.get(f"/api/bookings/providers/{self.provider.id}/slots/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual([s["id"] for s in response.json()], [self.slot.id])
        self.assertEqual(self.client.get(f"/api/bookings/providers/{self.unverified.id}/slots/").json(), [])

    # --- my bookings / accept -----------------------------------------
    def test_customer_sees_only_own_bookings(self):
        Booking.objects.create(customer=self.customer, slot=self.slot)
        self.login(self.customer2)
        self.assertEqual(self.client.get("/api/bookings/mine/").json(), [])
        self.login(self.customer)
        data = self.client.get("/api/bookings/mine/").json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["status"], "pending")

    def test_provider_accepts_own_booking(self):
        booking = Booking.objects.create(customer=self.customer, slot=self.slot)
        self.login(self.provider.user)
        self.assertEqual(len(self.client.get("/api/bookings/incoming/").json()), 1)
        response = self.client.post(f"/api/bookings/{booking.id}/accept/")
        self.assertEqual(response.status_code, 200)
        booking.refresh_from_db()
        self.assertEqual(booking.status, "accepted")

    def test_other_provider_or_customer_cannot_accept(self):
        booking = Booking.objects.create(customer=self.customer, slot=self.slot)
        self.login(self.other_provider.user)
        self.assertEqual(self.client.post(f"/api/bookings/{booking.id}/accept/").status_code, 404)
        self.assertEqual(self.client.get("/api/bookings/incoming/").json(), [])
        self.login(self.customer)
        self.assertEqual(self.client.post(f"/api/bookings/{booking.id}/accept/").status_code, 403)
        booking.refresh_from_db()
        self.assertEqual(booking.status, "pending")


class TimeSlotManagementTests(APITestCase):
    def setUp(self):
        user = User.objects.create_user("pro@example.com", password=PASSWORD)
        self.provider = ProviderProfile.objects.create(user=user, phone="1", business_name="Pro", status="verified")
        self.customer = User.objects.create_user("cust@example.com", password=PASSWORD)
        self.tomorrow = str(timezone.localdate() + timedelta(days=1))

    def test_provider_adds_and_lists_slots(self):
        self.client.force_login(self.provider.user)
        response = self.client.post(
            "/api/bookings/my-slots/", {"date": self.tomorrow, "start_time": "09:00", "end_time": "10:00"}
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(self.client.get("/api/bookings/my-slots/").json()), 1)

    def test_invalid_slots_are_rejected(self):
        self.client.force_login(self.provider.user)
        slot = {"date": self.tomorrow, "start_time": "09:00", "end_time": "10:00"}
        self.client.post("/api/bookings/my-slots/", slot)
        self.assertEqual(self.client.post("/api/bookings/my-slots/", slot).status_code, 400)  # duplicate
        backwards = {"date": self.tomorrow, "start_time": "12:00", "end_time": "11:00"}
        self.assertEqual(self.client.post("/api/bookings/my-slots/", backwards).status_code, 400)
        yesterday = {"date": str(timezone.localdate() - timedelta(days=1)), "start_time": "09:00", "end_time": "10:00"}
        self.assertEqual(self.client.post("/api/bookings/my-slots/", yesterday).status_code, 400)

    def test_customer_cannot_manage_slots(self):
        self.client.force_login(self.customer)
        self.assertEqual(self.client.get("/api/bookings/my-slots/").status_code, 403)

    def test_delete_free_slot_but_not_booked_one(self):
        free = TimeSlot.objects.create(provider=self.provider, date=self.tomorrow, start_time="09:00", end_time="10:00")
        taken = TimeSlot.objects.create(
            provider=self.provider, date=self.tomorrow, start_time="11:00", end_time="12:00", is_booked=True
        )
        self.client.force_login(self.provider.user)
        self.assertEqual(self.client.delete(f"/api/bookings/my-slots/{free.id}/").status_code, 204)
        self.assertEqual(self.client.delete(f"/api/bookings/my-slots/{taken.id}/").status_code, 403)
        self.assertTrue(TimeSlot.objects.filter(pk=taken.id).exists())


class ProviderServiceApiTests(APITestCase):
    """The dashboard's add / edit service calls (category is sent as an id)."""

    def test_create_edit_service(self):
        category = ServiceCategory.objects.create(name="Plumbing")
        user = User.objects.create_user("pro@example.com", password=PASSWORD)
        ProviderProfile.objects.create(user=user, phone="1", business_name="Pro", status="verified")
        self.client.force_login(user)
        response = self.client.post(
            "/api/services/my-services/",
            {"title": "Fix tap", "category": category.id, "price": "85.00", "description": "Quick fix"},
        )
        self.assertEqual(response.status_code, 201, response.content)
        self.assertEqual(response.json()["category_name"], "Plumbing")
        service_id = response.json()["id"]
        response = self.client.put(
            f"/api/services/my-services/{service_id}/",
            {"title": "Fix taps", "category": category.id, "price": "90.00"},
        )
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(Service.objects.get().title, "Fix taps")
