"""
Alert model - Represents smart notifications for users
"""
from datetime import datetime
from typing import Dict, Optional
import uuid


class Alert:
    """
    Alert class for user notifications
    Types: upcoming_payment, unused_subscription, cost_spike, savings_opportunity
    """
    
    ALERT_TYPES = {
        'upcoming_payment': {
            'icon': '💳',
            'color': '#3b82f6',
            'priority': 'medium'
        },
        'unused_subscription': {
            'icon': '⚠️',
            'color': '#f59e0b',
            'priority': 'high'
        },
        'cost_spike': {
            'icon': '📈',
            'color': '#ef4444',
            'priority': 'high'
        },
        'savings_opportunity': {
            'icon': '💰',
            'color': '#10b981',
            'priority': 'low'
        }
    }
    
    def __init__(self, user_id: str, alert_type: str, message: str,
                 metadata: Optional[Dict] = None, alert_id: Optional[str] = None,
                 is_read: bool = False):
        if alert_type not in self.ALERT_TYPES:
            raise ValueError(f"Invalid alert type: {alert_type}")
        
        self._alert_id = alert_id or str(uuid.uuid4())
        self._user_id = user_id
        self._type = alert_type
        self._message = message
        self._metadata = metadata or {}
        self._is_read = is_read
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
    def metadata(self) -> Dict:
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
    
    def to_dict(self) -> Dict:
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
    def from_dict(cls, data: Dict) -> 'Alert':
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
