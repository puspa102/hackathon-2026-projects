"""
Custom JWT authentication that supports both NormalUser and MedicalPersonnel.
"""

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework.exceptions import AuthenticationFailed

from .models import NormalUser, MedicalPersonnel


class DualUserJWTAuthentication(JWTAuthentication):
    """
    Extended JWT authentication that resolves users from both NormalUser
    and MedicalPersonnel tables instead of only AUTH_USER_MODEL.
    
    This allows both user types to access protected endpoints with JWT tokens.
    """

    def get_user(self, validated_token):
        """
        Attempt to find the user in both NormalUser and MedicalPersonnel tables.
        Override of parent method to handle multiple user models.
        """
        try:
            # Use 'user_id' as the claim key (standard JWT claim from SimpleJWT)
            user_id = validated_token.get('user_id')
            if not user_id:
                raise KeyError("user_id")
        except KeyError:
            raise InvalidToken("Token contained no recognizable user identification")

        # Try NormalUser first
        try:
            user = NormalUser.objects.get(pk=user_id)
            return user
        except NormalUser.DoesNotExist:
            pass

        # Try MedicalPersonnel second
        try:
            user = MedicalPersonnel.objects.get(pk=user_id)
            return user
        except MedicalPersonnel.DoesNotExist:
            raise InvalidToken("Token user not found")
