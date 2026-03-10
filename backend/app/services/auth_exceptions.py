"""Auth service exceptions."""


class EmailAlreadyInUseError(Exception):
    """Raised when registering with an email that already exists."""
