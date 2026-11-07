from django.contrib.auth import authenticate, login, logout
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ProviderProfile
from .serializers import (
    LoginSerializer,
    ProviderProfileSerializer,
    RegisterSerializer,
    user_data,
)

# Owner: Haris


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # We don't log them in here, they go to the Login page next.
        return Response({"message": "Account created, please log in"}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            request,
            username=serializer.validated_data["email"].lower(),
            password=serializer.validated_data["password"],
        )
        if user is None:
            # Same message either way, so nobody can test which emails exist.
            return Response({"detail": "Invalid email or password."}, status=status.HTTP_400_BAD_REQUEST)
        login(request, user)
        return Response({"user": user_data(user)})


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logout(request)
        return Response({"message": "Logged out"})


@method_decorator(ensure_csrf_cookie, name="dispatch")
class MeView(APIView):
    """React calls this on page load to find out who is logged in."""

    permission_classes = [AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            return Response({"user": user_data(request.user)})
        return Response({"user": None})


class ProviderProfileView(APIView):
    """The logged in provider reads and submits their verification form."""

    permission_classes = [IsAuthenticated]

    def get_profile(self, request):
        return get_object_or_404(ProviderProfile, user=request.user)

    def get(self, request):
        return Response(ProviderProfileSerializer(self.get_profile(request), context={"request": request}).data)

    def post(self, request):
        profile = self.get_profile(request)
        if not profile.can_submit:
            return Response(
                {"detail": "Your profile can't be changed while it is pending or verified."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = ProviderProfileSerializer(profile, data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        # Sending the form moves it to Pending and clears any old rejection.
        serializer.save(status=ProviderProfile.Status.PENDING, rejection_reason="")
        return Response(serializer.data)


class ProviderDocumentView(APIView):
    """Lets an admin open a provider's ID document from the admin panel."""

    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        profile = get_object_or_404(ProviderProfile, pk=pk)
        if not profile.id_document:
            raise Http404
        return FileResponse(profile.id_document.open("rb"), as_attachment=True)
