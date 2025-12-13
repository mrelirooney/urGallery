from rest_framework import serializers
from accounts.models import User, Profile
from themes.models import Theme
from tags.models import Hashtag
from portfolios.models import Portfolio, Page
import re

class ThemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Theme
        fields = ("id", "key", "name", "version", "is_active", "css_vars_json", "assets_manifest", "preview_s3_key")

class HashtagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hashtag
        fields = ("id", "name", "slug", "created_at")

class ProfileSerializer(serializers.ModelSerializer):
    theme = ThemeSerializer(read_only=True)
    class Meta:
        model = Profile
        fields = (
            "display_name","title","location","bio",
            "default_avatar","avatar_s3_key",
            "website_url","instagram_url","twitter_url","behance_url","dribbble_url","youtube_url","tiktok_url",
            "linkedin_url","twitch_url","email_contact",
            "contact_order",
            "theme",
        )

class ProfileWriteSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    last_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    
    class Meta:
        model = Profile
        fields = (
            "display_name","title","location","bio",
            "default_avatar","avatar_s3_key",
            "banner_image",
            "website_url","instagram_url","twitter_url","behance_url","dribbble_url","youtube_url","tiktok_url",
            "linkedin_url","twitch_url","email_contact",
            "contact_order",
            "theme",
            "first_name","last_name",  # User fields
        )
    
    def validate(self, data):
        """Validate that contact fields don't contain phone numbers"""
        # Phone number patterns to block
        phone_pattern = re.compile(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+\d{10,15}')
        
        contact_fields = [
            'website_url', 'instagram_url', 'twitter_url', 'behance_url', 
            'dribbble_url', 'youtube_url', 'tiktok_url', 'linkedin_url', 
            'twitch_url', 'email_contact'
        ]
        
        for field in contact_fields:
            value = data.get(field, '')
            if value and phone_pattern.search(value):
                raise serializers.ValidationError({
                    field: "Phone numbers are not allowed in contact fields. Please use a URL or email."
                })
        
        return data
    
    def update(self, instance, validated_data):
        # Extract User fields
        first_name = validated_data.pop("first_name", None)
        last_name = validated_data.pop("last_name", None)
        
        # Update Profile fields
        profile = super().update(instance, validated_data)
        
        # Update User fields
        user = profile.user
        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        user.save()
        
        return profile

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    class Meta:
        model = User
        fields = ("id","email","first_name","last_name","display_name","profile")

class PortfolioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Portfolio
        fields = ("id", "user", "title", "privacy", "order_index", "pages_count", "created_at", "updated_at", "slug")
        read_only_fields = ("id", "user", "pages_count", "created_at", "updated_at", "slug")

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        # Set default privacy to link_only if not provided
        if "privacy" not in validated_data:
            validated_data["privacy"] = "link_only"
        return super().create(validated_data)

class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = ("id", "portfolio", "title", "description", "layout", "order", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_portfolio(self, portfolio):
        # ensure you can only add pages to your own portfolio
        req_user = self.context["request"].user
        if portfolio.user_id != req_user.id:
            raise serializers.ValidationError("Not your portfolio.")
        return portfolio
    
    
