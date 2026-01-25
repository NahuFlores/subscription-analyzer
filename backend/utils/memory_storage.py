"""
In-memory storage for demo mode (when Firebase is unavailable)
"""
from typing import Dict, List, Optional


class InMemoryStorage:
    """Simple in-memory storage for demo purposes"""
    
    def __init__(self):
        self._users = {}
        self._subscriptions = {}
        self._alerts = {}
    
    # User operations
    def create_user(self, user_data: Dict) -> bool:
        self._users[user_data['user_id']] = user_data
        return True
    
    def get_user(self, user_id: str) -> Optional[Dict]:
        return self._users.get(user_id)
    
    def update_user(self, user_id: str, user_data: Dict) -> bool:
        if user_id in self._users:
            self._users[user_id].update(user_data)
            return True
        return False
    
    # Subscription operations
    def create_subscription(self, subscription_data: Dict) -> bool:
        self._subscriptions[subscription_data['subscription_id']] = subscription_data
        return True
    
    def get_subscription(self, subscription_id: str) -> Optional[Dict]:
        return self._subscriptions.get(subscription_id)
    
    def get_user_subscriptions(self, user_id: str) -> List[Dict]:
        return [sub for sub in self._subscriptions.values() 
                if sub.get('user_id') == user_id]
    
    def update_subscription(self, subscription_id: str, subscription_data: Dict) -> bool:
        if subscription_id in self._subscriptions:
            self._subscriptions[subscription_id].update(subscription_data)
            return True
        return False
    
    def delete_subscription(self, subscription_id: str) -> bool:
        if subscription_id in self._subscriptions:
            del self._subscriptions[subscription_id]
            return True
        return False
    
    # Alert operations
    def create_alert(self, alert_data: Dict) -> bool:
        self._alerts[alert_data['alert_id']] = alert_data
        return True
    
    def get_user_alerts(self, user_id: str, unread_only: bool = False) -> List[Dict]:
        alerts = [alert for alert in self._alerts.values() 
                 if alert.get('user_id') == user_id]
        
        if unread_only:
            alerts = [a for a in alerts if not a.get('is_read', False)]
        
        return sorted(alerts, key=lambda x: x.get('created_at', ''), reverse=True)
    
    def mark_alert_as_read(self, alert_id: str) -> bool:
        if alert_id in self._alerts:
            self._alerts[alert_id]['is_read'] = True
            return True
        return False
    
    def delete_alert(self, alert_id: str) -> bool:
        if alert_id in self._alerts:
            del self._alerts[alert_id]
            return True
        return False


# Global instance
_storage = InMemoryStorage()

def get_storage() -> InMemoryStorage:
    """Get the global storage instance"""
    return _storage
