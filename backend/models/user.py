"""
User model - Represents a user in the subscription analyzer system
"""
from datetime import datetime
from typing import List, Dict, Optional


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
                 preferences: Optional[Dict] = None):
        self._user_id = user_id
        self._email = email
        self._name = name
        self._created_at = created_at or datetime.now()
        self._preferences = preferences or {
            'currency': 'USD',
            'notifications_enabled': True,
            'alert_threshold': 100.0
        }
    
    # Getters (Encapsulation)
    @property
    def user_id(self) -> str:
        return self._user_id
    
    @property
    def email(self) -> str:
        return self._email
    
    @property
    def name(self) -> str:
        return self._name
    
    @property
    def created_at(self) -> datetime:
        return self._created_at
    
    @property
    def preferences(self) -> Dict:
        return self._preferences.copy()
    
    # Setters
    @name.setter
    def name(self, value: str):
        if not value or len(value.strip()) == 0:
            raise ValueError("Name cannot be empty")
        self._name = value.strip()
    
    def update_preferences(self, preferences: Dict):
        """Update user preferences"""
        self._preferences.update(preferences)
    
    def to_dict(self) -> Dict:
        """Convert user object to dictionary for Firebase storage"""
        return {
            'user_id': self._user_id,
            'email': self._email,
            'name': self._name,
            'created_at': self._created_at.isoformat(),
            'preferences': self._preferences
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'User':
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
