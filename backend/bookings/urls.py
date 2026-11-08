from django.urls import path

from . import views

urlpatterns = [
    path("", views.BookingCreateView.as_view(), name="booking-create"),
    path("mine/", views.MyBookingsView.as_view(), name="my-bookings"),
    path("incoming/", views.IncomingBookingsView.as_view(), name="incoming-bookings"),
    path("<int:pk>/accept/", views.AcceptBookingView.as_view(), name="booking-accept"),
    path("providers/<int:pk>/slots/", views.ProviderFreeSlotsView.as_view(), name="provider-free-slots"),
    path("my-slots/", views.MySlotsView.as_view(), name="my-slots"),
    path("my-slots/<int:pk>/", views.MySlotDetailView.as_view(), name="my-slot-detail"),
]
