"""
Alert model - Represents smart notifications for users
"""
from datetime import datetime
from typing import Optional
import uuid


class Alert:
    """
    Alert class for user notifications
    """
    
    ALERT_TYPES = {
        'upcoming_payment': {
            'icon': 'credit-card',
            'color': '#3b82f6',
            'priority': 'medium'
        },
        'unused_subscription': {
            'icon': 'warning',
            'color': '#f59e0b',
            'priority': 'high'
        },
        'cost_spike': {
            'icon': 'trending-up',
            'color': '#ef4444',
            'priority': 'high'
        },
        'savings_opportunity': {
            'icon': 'dollar-sign',
            'color': '#10b981',
            'priority': 'low'
        }
    }
    
    def __init__(self, user_id: str, alert_type: str, message: str,
                 metadata: Optional[dict] = None, alert_id: Optional[str] = None,
                 is_read: bool = False):
        """
        Initialize alert with validation
        
        Raises:
            TypeError: If arguments have incorrect types
            ValueError: If arguments have invalid values
        """
        # Type Validation
        if not isinstance(user_id, str):
            raise TypeError("user_id must be string")
        if not isinstance(alert_type, str):
             raise TypeError("alert_type must be string")
        if not isinstance(message, str):
            raise TypeError("message must be string")
        if metadata is not None and not isinstance(metadata, dict):
            raise TypeError("metadata must be dict or None")

        # Value Validation
        if not user_id.strip():
            raise ValueError("user_id must be non-empty string")
        if not message.strip():
            raise ValueError("message must be non-empty string")
            
        if alert_type not in self.ALERT_TYPES:
            raise ValueError(
                f"Invalid alert type: {alert_type}. "
                f"Must be one of: {', '.join(self.ALERT_TYPES.keys())}"
            )
            
        # Size Validation
        if len(message) > 500:
            raise ValueError("message too long (max 500 characters)")
            
        if metadata:
            import sys
            # Rough estimate of metadata size
            metadata_str = str(metadata)
            if len(metadata_str) > 10000:  # ~10KB limit text representation
                # Using len(str) is safer than sys.getsizeof for cross-platform/deep structures check simply
                raise ValueError("metadata too large (max 10KB representation)")

        self._alert_id = alert_id or str(uuid.uuid4())
        self._user_id = user_id.strip()
        self._type = alert_type
        self._message = message.strip()
        self._metadata = metadata.copy() if metadata else {}
        self._is_read = bool(is_read)
        self._created_at = datetime.now()
    
    @property
    def alert_id(self) -> str:
        return self._alert_id
    
    @property
    def user_id(self) -> str:
        return self._user_id
    
    @property
    def type(self) -> str:
        return self._type
    
    @property
    def message(self) -> str:
        return self._message
    
    @property
    def metadata(self) -> dict:
        return self._metadata.copy()
    
    @property
    def is_read(self) -> bool:
        return self._is_read
    
    @property
    def created_at(self) -> datetime:
        return self._created_at
    
    @property
    def icon(self) -> str:
        return self.ALERT_TYPES[self._type]['icon']
    
    @property
    def color(self) -> str:
        return self.ALERT_TYPES[self._type]['color']
    
    @property
    def priority(self) -> str:
        return self.ALERT_TYPES[self._type]['priority']
    
    def mark_as_read(self):
        """Mark alert as read"""
        self._is_read = True
    
    def to_dict(self) -> dict:
        """Convert alert to dictionary for Firebase storage"""
        return {
            'alert_id': self._alert_id,
            'user_id': self._user_id,
            'type': self._type,
            'message': self._message,
            'metadata': self._metadata,
            'is_read': self._is_read,
            'created_at': self._created_at.isoformat(),
            'icon': self.icon,
            'color': self.color,
            'priority': self.priority
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Alert':
        """Create Alert from dictionary"""
        return cls(
            alert_id=data.get('alert_id'),
            user_id=data['user_id'],
            alert_type=data['type'],
            message=data['message'],
            metadata=data.get('metadata', {}),
            is_read=data.get('is_read', False)
        )
    
    def __repr__(self) -> str:
        return f"Alert(type={self._type}, user={self._user_id}, read={self._is_read})"
    
    def __str__(self) -> str:
        return f"{self.icon} {self._message}"
