from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):
    """
    Read the access token from the 'access' cookie (fallback to Authorization header).
    """
    def authenticate(self, request):
        # Try standard header first
        header = self.get_header(request)
        if header is not None:
            raw_token = self.get_raw_token(header)
            if raw_token is not None:
                validated = self.get_validated_token(raw_token)
                return self.get_user(validated), validated

        # Fallback: cookie
        raw_token = request.COOKIES.get("access")
        if not raw_token:
            return None

        validated = self.get_validated_token(raw_token)
        return self.get_user(validated), validated
