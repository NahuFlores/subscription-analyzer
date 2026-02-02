"""
User model - Represents a user in the subscription analyzer system
"""
from datetime import datetime
from typing import Optional


class User:
    """
    User class representing a user account
    
    Attributes:
        user_id (str): Unique identifier for the user
        email (str): User's email address
        name (str): User's display name
        created_at (datetime): Account creation timestamp
        preferences (dict): User preferences and settings
    """
    
    def __init__(self, user_id: str, email: str, name: str, 
                 created_at: Optional[datetime] = None, 
                 preferences: Optional[dict] = None):
        """Initialize with validation"""
        # Type Validation
        if not isinstance(user_id, str):
            raise TypeError(f"user_id must be str, got {type(user_id).__name__}")
        if not isinstance(email, str):
            raise TypeError(f"email must be str, got {type(email).__name__}")
        
        # Value Validation
        if not user_id.strip():
            raise ValueError("user_id must be non-empty string")
        if not email.strip():
            raise ValueError("email must be non-empty string")
            
        # Email format validation
        if not self._is_valid_email(email):
            raise ValueError(f"Invalid email format: {email}")
        
        self._user_id = user_id.strip()
        self._email = email.strip().lower()
        
        # Use setter for name validation
        self.name = name  # This will trigger the @name.setter validation
        
        self._created_at = created_at or datetime.now()
        self._preferences = preferences or {
            'currency': 'USD',
            'notifications_enabled': True,
            'alert_threshold': 100.0
        }

    @staticmethod
    def _is_valid_email(email: str) -> bool:
        """Validate email format"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    # Properties
    @property
    def user_id(self) -> str:
        return self._user_id
    
    @property
    def email(self) -> str:
        return self._email
    
    @property
    def name(self) -> str:
        return self._name
    
    @name.setter
    def name(self, value: str):
        """Validate and set name"""
        if not isinstance(value, str):
            raise TypeError(f"name must be string, got {type(value).__name__}")
        
        value = value.strip()
        if not value:
            raise ValueError("Name cannot be empty")
        if len(value) > 100:
            raise ValueError("Name too long (max 100 characters)")
        
        self._name = value
    
    @property
    def created_at(self) -> datetime:
        return self._created_at
    
    @property
    def preferences(self) -> dict:
        return self._preferences.copy()
    
    def update_preferences(self, preferences: dict):
        """Update user preferences"""
        self._preferences.update(preferences)
    
    def to_dict(self) -> dict:
        """Convert user object to dictionary for Firebase storage"""
        return {
            'user_id': self._user_id,
            'email': self._email,
            'name': self._name,
            'created_at': self._created_at.isoformat(),
            'preferences': self._preferences
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'User':
        """Create User object from dictionary"""
        return cls(
            user_id=data['user_id'],
            email=data['email'],
            name=data['name'],
            created_at=datetime.fromisoformat(data['created_at']),
            preferences=data.get('preferences')
        )
    
    def __repr__(self) -> str:
        return f"User(id={self._user_id}, email={self._email}, name={self._name})"
    
    def __str__(self) -> str:
        return f"{self._name} ({self._email})"
