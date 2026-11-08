from django.urls import path
from . import views

urlpatterns = [
    # Fixed line: changed ServiceListView to ProviderListView
    path("categories/", views.CategoryListView.as_view(), name="category-list"),
    path("providers/", views.ProviderListView.as_view(), name="provider-list"),
    path("providers/<int:pk>/", views.ProviderDetailView.as_view(), name="provider-detail"),
    
    # Haris tasks: Service CRUD routes
    path("my-services/", views.ProviderServiceListCreateView.as_view(), name="provider-services-list-create"),
    path("my-services/<int:pk>/", views.ProviderServiceDetailView.as_view(), name="provider-service-detail"),
]