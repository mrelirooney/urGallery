from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):
    """
    Read JWT from the 'access' cookie when no Authorization header is present.
    """
    def authenticate(self, request):
        # Try normal header first
        header = self.get_header(request)
        if header is not None:
            return super().authenticate(request)

        # Fall back to cookie
        raw_token = request.COOKIES.get("access")
        if not raw_token:
            return None

        validated_token = self.get_validated_token(raw_token)
        return (self.get_user(validated_token), validated_token)
