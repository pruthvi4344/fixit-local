import shutil
import tempfile
from io import BytesIO

from django.contrib.auth.models import User
from django.core.files.storage import FileSystemStorage
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from PIL import Image
from rest_framework.test import APIClient, APITestCase

from services.models import ServiceCategory

from .admin import ProviderProfileForm
from .models import CustomerProfile, ProviderProfile

PASSWORD = "Fix1t-Local-2026"


def fake_photo():
    buffer = BytesIO()
    Image.new("RGB", (10, 10)).save(buffer, "PNG")
    return SimpleUploadedFile("photo.png", buffer.getvalue(), content_type="image/png")


def fake_document(name="licence.pdf"):
    return SimpleUploadedFile(name, b"%PDF-1.4 test", content_type="application/pdf")


class AuthTests(APITestCase):
    def register(self, role="customer", email="sam@example.com", password=PASSWORD):
        return self.client.post("/api/accounts/register/", {
            "name": "Sam Lee", "email": email, "phone": "519-555-0100", "password": password, "role": role,
        })

    def test_register_customer_then_login_and_logout(self):
        response = self.register()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["message"], "Account created, please log in")
        self.assertTrue(CustomerProfile.objects.filter(user__email="sam@example.com").exists())

        # Registering doesn't log you in.
        self.assertIsNone(self.client.get("/api/accounts/me/").data["user"])

        response = self.client.post("/api/accounts/login/", {"email": "SAM@example.com", "password": PASSWORD})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["user"]["role"], "customer")
        self.assertEqual(self.client.get("/api/accounts/me/").data["user"]["name"], "Sam Lee")

        self.client.post("/api/accounts/logout/")
        self.assertIsNone(self.client.get("/api/accounts/me/").data["user"])

    def test_register_provider_starts_incomplete(self):
        self.register(role="provider")
        profile = ProviderProfile.objects.get(user__email="sam@example.com")
        self.assertEqual(profile.status, "incomplete")

    def test_duplicate_email_is_refused(self):
        self.register()
        response = self.register(email="SAM@example.com")
        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data)

    def test_weak_password_is_refused(self):
        response = self.register(password="123")
        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.data)
        self.assertFalse(User.objects.exists())

    def test_wrong_password_is_refused(self):
        self.register()
        response = self.client.post("/api/accounts/login/", {"email": "sam@example.com", "password": "nope"})
        self.assertEqual(response.status_code, 400)

    def test_logout_needs_csrf_token_when_logged_in(self):
        self.register()
        client = APIClient(enforce_csrf_checks=True)
        client.post("/api/accounts/login/", {"email": "sam@example.com", "password": PASSWORD})
        self.assertEqual(client.post("/api/accounts/logout/").status_code, 403)


class VerificationTests(APITestCase):
    def setUp(self):
        # Keep test uploads out of the real folders.
        self.folder = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.folder, ignore_errors=True)
        media = override_settings(MEDIA_ROOT=self.folder)
        media.enable()
        self.addCleanup(media.disable)
        field = ProviderProfile._meta.get_field("id_document")
        old_storage = field.storage
        field.storage = FileSystemStorage(location=self.folder)
        self.addCleanup(setattr, field, "storage", old_storage)

        self.category = ServiceCategory.objects.create(name="Plumbing")
        self.user = User.objects.create_user("pro@example.com", "pro@example.com", PASSWORD, first_name="Pat")
        self.profile = ProviderProfile.objects.create(user=self.user, phone="5195550100")
        self.client.login(username="pro@example.com", password=PASSWORD)

    def form(self, **changes):
        data = {
            "business_name": "Pat's Plumbing", "categories": [self.category.id], "service_area": "Windsor",
            "years_experience": 5, "bio": "Fast and friendly.", "photo": fake_photo(), "id_document": fake_document(),
        }
        data.update(changes)
        return {key: value for key, value in data.items() if value is not None}

    def submit(self, **changes):
        return self.client.post("/api/accounts/provider/profile/", self.form(**changes), format="multipart")

    def search(self):
        return APIClient().get("/api/accounts/providers/").data

    def test_submit_moves_to_pending_and_stays_out_of_search(self):
        response = self.submit()
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["status"], "pending")
        self.assertTrue(response.data["has_id_document"])
        self.assertNotIn("id_document", response.data)
        self.assertEqual(self.search(), [])

    def test_files_are_required_the_first_time(self):
        response = self.submit(photo=None, id_document=None)
        self.assertEqual(response.status_code, 400)
        self.assertIn("photo", response.data)
        self.assertIn("id_document", response.data)

    def test_bad_document_type_is_refused(self):
        response = self.submit(id_document=fake_document("virus.exe"))
        self.assertEqual(response.status_code, 400)
        self.assertIn("id_document", response.data)

    def test_cannot_change_status_from_the_form(self):
        response = self.submit(status="verified")
        self.assertEqual(response.data["status"], "pending")

    def test_cannot_submit_again_while_pending(self):
        self.submit()
        self.assertEqual(self.submit().status_code, 400)

    def test_verified_provider_appears_in_search(self):
        self.submit()
        ProviderProfile.objects.update(status="verified")
        results = self.search()
        self.assertEqual(results[0]["name"], "Pat's Plumbing")
        self.assertTrue(results[0]["is_verified"])
        self.assertNotIn("phone", results[0])
        self.assertEqual(len(APIClient().get("/api/accounts/providers/?category=999").data), 0)

    def test_rejected_provider_sees_reason_and_can_resubmit_without_new_files(self):
        self.submit()
        ProviderProfile.objects.update(status="rejected", rejection_reason="ID photo unclear")
        self.assertEqual(self.client.get("/api/accounts/provider/profile/").data["rejection_reason"], "ID photo unclear")

        response = self.submit(photo=None, id_document=None, bio="Updated bio.")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["status"], "pending")
        self.assertEqual(response.data["rejection_reason"], "")

    def test_reject_needs_a_reason(self):
        form = ProviderProfileForm({"status": "rejected", "rejection_reason": " "}, instance=self.profile)
        self.assertFalse(form.is_valid())
        self.assertIn("rejection_reason", form.errors)

    def test_only_admins_can_download_the_document(self):
        self.submit()
        url = f"/api/accounts/providers/{self.profile.pk}/id-document/"
        self.assertEqual(self.client.get(url).status_code, 403)
        self.assertEqual(APIClient().get(url).status_code, 403)

        User.objects.create_superuser("admin", "admin@example.com", PASSWORD)
        admin = APIClient()
        admin.login(username="admin", password=PASSWORD)
        self.assertEqual(admin.get(url).status_code, 200)

    def test_customer_has_no_provider_form(self):
        customer = User.objects.create_user("c@example.com", "c@example.com", PASSWORD)
        CustomerProfile.objects.create(user=customer, phone="5195550100")
        client = APIClient()
        client.login(username="c@example.com", password=PASSWORD)
        self.assertEqual(client.get("/api/accounts/provider/profile/").status_code, 404)

    def admin_client(self):
        User.objects.create_superuser("admin", "admin@example.com", PASSWORD)
        admin = APIClient()
        admin.login(username="admin", password=PASSWORD)
        return admin

    def test_admin_can_reject_with_a_reason_on_the_review_page(self):
        self.submit()
        admin = self.admin_client()
        url = f"/admin/accounts/providerprofile/{self.profile.pk}/change/"
        page = admin.get(url)
        self.assertContains(page, "Download document")
        self.assertContains(page, "Plumbing")

        response = admin.post(url, {"status": "rejected", "rejection_reason": "ID photo unclear"}, format="multipart")
        self.assertEqual(response.status_code, 302)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.status, "rejected")
        self.assertEqual(self.profile.rejection_reason, "ID photo unclear")

    def test_admin_can_approve_from_the_list_page(self):
        self.submit()
        admin = self.admin_client()
        admin.post("/admin/accounts/providerprofile/", {
            "action": "approve_providers", "_selected_action": [self.profile.pk],
        }, format="multipart")
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.status, "verified")
