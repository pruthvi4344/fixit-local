from django.urls import path

from . import views

urlpatterns = [
    path("categories/", views.CategoryListView.as_view()),
    path("providers/", views.ProviderListView.as_view()),
    path("providers/<int:pk>/", views.ProviderDetailView.as_view()),
]
