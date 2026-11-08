from django.urls import path

from . import views

urlpatterns = [
    path("categories/", views.CategoryListView.as_view()),
    path("providers/", views.ProviderListView.as_view()),
    path("providers/<int:pk>/", views.ProviderDetailView.as_view()),path('my-services/', ProviderServiceListCreateView.as_view(), name='provider-services-list-create'),
    path('my-services/<int:pk>/', ProviderServiceDetailView.as_view(), name='provider-service-detail'),
]
