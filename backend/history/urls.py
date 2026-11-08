from django.urls import path

from . import views

urlpatterns = [
    path("", views.HistoryView.as_view()),
    path("visit/", views.VisitView.as_view()),
]