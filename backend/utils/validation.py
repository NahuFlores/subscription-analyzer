"""
Centralized validation utilities
"""
import re
import bleach
import validators
from typing import Any, List, Optional, Union
from datetime import datetime, timedelta

class ValidationError(Exception):
    """Custom validation error"""
    pass

class Validator:
    """Utility class for input validation"""
    
    @staticmethod
    def validate_user_id(user_id: Any, field_name: str = "user_id") -> str:
        """
        Validate user ID
        
        Args:
            user_id: The user ID to validate
            field_name: The name of the field for error messages
            
        Returns:
            The validated and stripped user ID
            
        Raises:
            ValidationError: If validation fails
        """
        if not user_id:
            raise ValidationError(f"{field_name} is required")
        
        if not isinstance(user_id, str):
            raise ValidationError(
                f"{field_name} must be string, got {type(user_id).__name__}"
            )
        
        user_id = user_id.strip()
        
        if not user_id:
            raise ValidationError(f"{field_name} cannot be empty")
        
        if len(user_id) > 128:
            raise ValidationError(f"{field_name} too long (max 128 chars)")
        
        # Only alphanumeric, hyphens, underscores
        if not re.match(r'^[a-zA-Z0-9_-]+$', user_id):
            raise ValidationError(f"{field_name} contains invalid characters")
        
        return user_id
    
    @staticmethod
    def validate_email(email: Any) -> str:
        """Validate email format"""
        if not email:
            raise ValidationError("email is required")
        
        if not isinstance(email, str):
            raise ValidationError("email must be string")
        
        email = email.strip().lower()
        
        if not validators.email(email):
            raise ValidationError(f"Invalid email format: {email}")
        
        return email
    
    @staticmethod
    def sanitize_string(
        value: Any,
        field_name: str = "value",
        max_length: int = 200,
        allow_empty: bool = False
    ) -> str:
        """
        Sanitize string input (remove HTML, trim, validate length)
        """
        if not isinstance(value, str):
            raise ValidationError(
                f"{field_name} must be string, got {type(value).__name__}"
            )
        
        # Remove HTML tags using bleach (strip=True removes tags entirely)
        value = bleach.clean(value, tags=[], strip=True)
        value = value.strip()
        
        if not allow_empty and not value:
            raise ValidationError(f"{field_name} cannot be empty")
        
        if len(value) > max_length:
            raise ValidationError(
                f"{field_name} too long (max {max_length} chars)"
            )
        
        return value
    
    @staticmethod
    def validate_number(
        value: Any,
        field_name: str = "value",
        min_val: float = None,
        max_val: float = None,
        allow_zero: bool = True
    ) -> float:
        """Validate numeric input"""
        try:
            num = float(value)
        except (TypeError, ValueError):
            raise ValidationError(
                f"{field_name} must be a number, got {type(value).__name__}"
            )
        
        if not allow_zero and num == 0:
            raise ValidationError(f"{field_name} cannot be zero")
        
        if min_val is not None and num < min_val:
            raise ValidationError(f"{field_name} must be >= {min_val}")
        
        if max_val is not None and num > max_val:
            raise ValidationError(f"{field_name} must be <= {max_val}")
        
        return num
    
    @staticmethod
    def validate_choice(
        value: Any,
        choices: List[str],
        field_name: str = "value"
    ) -> str:
        """Validate value is in allowed choices"""
        if value not in choices:
            raise ValidationError(
                f"{field_name} must be one of: {', '.join(choices)}"
            )
        return value
    
    @staticmethod
    def validate_datetime(
        value: Any,
        field_name: str = "date",
        allow_future: bool = True
    ) -> datetime:
        """Validate and parse datetime"""
        if isinstance(value, datetime):
            dt = value
        elif isinstance(value, str):
            try:
                # Handle potential 'Z' for UTC
                dt = datetime.fromisoformat(value.replace('Z', '+00:00'))
            except ValueError:
                raise ValidationError(
                    f"Invalid {field_name} format. Use ISO 8601"
                )
        else:
            raise ValidationError(
                f"{field_name} must be datetime or ISO string"
            )
        
        if not allow_future and dt > datetime.now() + timedelta(days=1):
            raise ValidationError(f"{field_name} cannot be in the future")
        
        return dt
