from django.conf import settings
from django.contrib.auth.models import User
from django.core.management import call_command
from django.test import TestCase

from accounts.models import ProviderProfile

from .models import Service, ServiceCategory


class ProviderPagesTests(TestCase):
    def setUp(self):
        self.plumbing = ServiceCategory.objects.create(name="Plumbing")
        self.cleaning = ServiceCategory.objects.create(name="Cleaning")
        self.plumber = self.make_provider("Clearflow", self.plumbing, "verified")
        self.cleaner = self.make_provider("Spotless", self.cleaning, "verified")
        self.waiting = self.make_provider("Not Approved Yet", self.plumbing, "pending")
        Service.objects.create(provider=self.plumber, category=self.plumbing, title="Unblock a drain", price=120)
        Service.objects.create(provider=self.plumber, category=self.plumbing, title="Fix a leaking tap", price=85)

    def make_provider(self, name, category, status):
        user = User.objects.create_user(f"{name}@example.com")
        provider = ProviderProfile.objects.create(
            user=user, phone="5195550100", business_name=name, service_area="Windsor", status=status
        )
        provider.categories.add(category)
        return provider

    def names(self, query=""):
        response = self.client.get(f"/api/services/providers/{query}")
        self.assertEqual(response.status_code, 200)
        return [provider["name"] for provider in response.json()]

    def test_list_shows_verified_providers_only(self):
        self.assertEqual(self.names(), ["Clearflow", "Spotless"])

    def test_filter_by_category_and_keyword(self):
        self.assertEqual(self.names("?category=plumbing"), ["Clearflow"])
        self.assertEqual(self.names("?q=leaking"), ["Clearflow"])
        self.assertEqual(self.names("?q=windsor&category=Cleaning"), ["Spotless"])
        self.assertEqual(self.names("?category=Nothing"), [])

    def test_provider_matching_two_services_is_listed_once(self):
        self.assertEqual(self.names("?q=a"), ["Clearflow", "Spotless"])

    def test_card_shows_cheapest_price_and_no_private_details(self):
        card = self.client.get("/api/services/providers/").json()[0]
        self.assertEqual(card["starting_price"], "85.00")
        self.assertNotIn("phone", card)
        self.assertNotIn("id_document", card)

    def test_provider_without_services_has_no_price(self):
        card = self.client.get("/api/services/providers/").json()[1]
        self.assertIsNone(card["starting_price"])

    def test_profile_lists_services_cheapest_first(self):
        data = self.client.get(f"/api/services/providers/{self.plumber.pk}/").json()
        self.assertEqual(data["name"], "Clearflow")
        self.assertEqual([s["title"] for s in data["services"]], ["Fix a leaking tap", "Unblock a drain"])
        self.assertEqual(data["services"][0]["price"], "85.00")
        self.assertNotIn("phone", data)

    def test_unverified_or_missing_profile_is_404(self):
        self.assertEqual(self.client.get(f"/api/services/providers/{self.waiting.pk}/").status_code, 404)
        self.assertEqual(self.client.get("/api/services/providers/99999/").status_code, 404)

    def test_list_does_not_run_more_queries_for_more_providers(self):
        with self.assertNumQueries(4):
            self.client.get("/api/services/providers/")


class FixtureTests(TestCase):
    def test_sample_data_loads_and_shows_on_the_page(self):
        call_command("loaddata", settings.BASE_DIR / "fixtures" / "initial_data.json", verbosity=0)
        providers = self.client.get("/api/services/providers/").json()
        self.assertEqual(len(providers), 11)
        self.assertTrue(all(provider["starting_price"] for provider in providers))

    def test_sample_accounts_cannot_log_in(self):
        call_command("loaddata", settings.BASE_DIR / "fixtures" / "initial_data.json", verbosity=0)
        for user in User.objects.all():
            self.assertFalse(user.has_usable_password())
