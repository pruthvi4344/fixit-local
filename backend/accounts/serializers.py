from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers

from services.models import ServiceCategory

from .models import CustomerProfile, ProviderProfile, document_type_validator

# Owner: Haris

MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5 MB


def get_role(user):
    if hasattr(user, "provider_profile"):
        return "provider"
    if hasattr(user, "customer_profile"):
        return "customer"
    return None  # for example an admin made with createsuperuser


def user_data(user):
    """The user details React keeps in AuthContext."""
    return {
        "id": user.id,
        "name": user.first_name or user.username,
        "email": user.email,
        "role": get_role(user),
    }


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField(max_length=150)
    phone = serializers.RegexField(
        r"^\+?[0-9 ()-]{7,20}$",
        error_messages={"invalid": "Enter a valid phone number."},
    )
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=["customer", "provider"])

    def validate_email(self, value):
        email = value.lower()
        if User.objects.filter(username=email).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return email

    def validate(self, data):
        # Run Django's password rules (length, too common, too like the name...).
        user = User(username=data["email"], email=data["email"], first_name=data["name"])
        try:
            validate_password(data["password"], user=user)
        except DjangoValidationError as error:
            raise serializers.ValidationError({"password": error.messages})
        return data

    @transaction.atomic
    def create(self, validated_data):
        # People log in with their email, so it is also the username.
        user = User.objects.create_user(
            username=validated_data["email"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data["name"],
        )
        if validated_data["role"] == "provider":
            ProviderProfile.objects.create(user=user, phone=validated_data["phone"])
        else:
            CustomerProfile.objects.create(user=user, phone=validated_data["phone"])
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField()


class ProviderProfileSerializer(serializers.ModelSerializer):
    """The verification form on the provider dashboard."""

    categories = serializers.PrimaryKeyRelatedField(
        many=True, queryset=ServiceCategory.objects.all(), allow_empty=False
    )
    # write_only: the document is never sent back, we only say if we have one.
    id_document = serializers.FileField(write_only=True, required=False, validators=[document_type_validator])
    has_id_document = serializers.SerializerMethodField()

    class Meta:
        model = ProviderProfile
        fields = [
            "business_name", "categories", "service_area", "years_experience", "bio",
            "photo", "id_document", "has_id_document", "status", "rejection_reason",
        ]
        read_only_fields = ["status", "rejection_reason"]
        extra_kwargs = {
            "business_name": {"required": True, "allow_blank": False},
            "service_area": {"required": True, "allow_blank": False},
            "bio": {"required": True, "allow_blank": False},
            "years_experience": {"required": True, "allow_null": False, "min_value": 0, "max_value": 70},
            "photo": {"required": False},
        }

    def get_has_id_document(self, profile):
        return bool(profile.id_document)

    def validate_photo(self, value):
        if value.size > MAX_UPLOAD_SIZE:
            raise serializers.ValidationError("The photo must be 5 MB or smaller.")
        return value

    def validate_id_document(self, value):
        if value.size > MAX_UPLOAD_SIZE:
            raise serializers.ValidationError("The document must be 5 MB or smaller.")
        return value

    def validate(self, data):
        # Files are only needed the first time. After a rejection the provider
        # can keep the old file and just fix what the admin asked for.
        errors = {}
        if "photo" not in data and not self.instance.photo:
            errors["photo"] = ["Please upload a profile photo."]
        if "id_document" not in data and not self.instance.id_document:
            errors["id_document"] = ["Please upload your ID or licence."]
        if errors:
            raise serializers.ValidationError(errors)
        return data
