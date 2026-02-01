"""
Firebase helper utilities for database operations
"""
import firebase_admin
from firebase_admin import credentials, firestore, auth
from typing import Dict, List, Optional
import os
from .memory_storage import get_storage


class FirebaseHelper:
    """
    Firebase integration helper class
    Handles all Firebase operations with in-memory fallback
    """
    
    _initialized = False
    _db = None
    _storage = None
    
    @classmethod
    def initialize(cls, credentials_path: Optional[str] = None):
        """
        Initialize Firebase Admin SDK
        
        Args:
            credentials_path: Path to Firebase credentials JSON file
        """
        if cls._initialized:
            return
        
        # Always initialize in-memory storage as fallback
        if cls._storage is None:
            cls._storage = get_storage()
            print("In-memory storage initialized for demo mode")
        
        try:
            if credentials_path and os.path.exists(credentials_path):
                cred = credentials.Certificate(credentials_path)
                firebase_admin.initialize_app(cred)
            else:
                # For development without credentials
                # In production, you MUST provide credentials
                print("Warning: Running without Firebase credentials (development mode)")
                print("   Data will not persist. Set FIREBASE_CREDENTIALS_PATH in .env")
                # Don't initialize Firebase in this case
                cls._initialized = True
                return
            
            cls._db = firestore.client()
            cls._initialized = True
            print("Firebase initialized successfully")
            
        except Exception as e:
            print(f"Error initializing Firebase: {e}")
            print("   Running in offline mode - using in-memory storage")
            cls._initialized = True
    
    @classmethod
    def get_db(cls):
        """Get Firestore database instance"""
        if not cls._initialized:
            cls.initialize()
        return cls._db
    
    @classmethod
    def is_available(cls) -> bool:
        """Check if Firebase is available"""
        return cls._db is not None
    
    # User operations
    @classmethod
    def create_user(cls, user_data: Dict) -> bool:
        """Create user document in Firestore or in-memory storage"""
        if cls.is_available():
            try:
                cls._db.collection('users').document(user_data['user_id']).set(user_data)
                return True
            except Exception as e:
                print(f"Error creating user in Firebase: {e}")
        
        # Fallback to in-memory storage
        if cls._storage:
            return cls._storage.create_user(user_data)
        return False
    
    @classmethod
    def get_user(cls, user_id: str) -> Optional[Dict]:
        """Get user document from Firestore or in-memory storage"""
        if cls.is_available():
            try:
                doc = cls._db.collection('users').document(user_id).get()
                return doc.to_dict() if doc.exists else None
            except Exception as e:
                print(f"Error getting user from Firebase: {e}")
        
        # Fallback to in-memory storage
        if cls._storage:
            return cls._storage.get_user(user_id)
        return None
    
    @classmethod
    def update_user(cls, user_id: str, user_data: Dict) -> bool:
        """Update user document"""
        if cls.is_available():
            try:
                cls._db.collection('users').document(user_id).update(user_data)
                return True
            except Exception as e:
                print(f"Error updating user in Firebase: {e}")
        
        # Fallback to in-memory storage
        if cls._storage:
            return cls._storage.update_user(user_id, user_data)
        return False
    
    # Subscription operations
    @classmethod
    def create_subscription(cls, subscription_data: Dict) -> bool:
        """Create subscription document"""
        if cls.is_available():
            try:
                cls._db.collection('subscriptions').document(
                    subscription_data['subscription_id']
                ).set(subscription_data)
                return True
            except Exception as e:
                print(f"Error creating subscription in Firebase: {e}")
        
        # Fallback to in-memory storage
        if cls._storage:
            return cls._storage.create_subscription(subscription_data)
        return False
    
    @classmethod
    def get_subscription(cls, subscription_id: str) -> Optional[Dict]:
        """Get subscription document"""
        if cls.is_available():
            try:
                doc = cls._db.collection('subscriptions').document(subscription_id).get()
                return doc.to_dict() if doc.exists else None
            except Exception as e:
                print(f"Error getting subscription from Firebase: {e}")
        
        # Fallback to in-memory storage
        if cls._storage:
            return cls._storage.get_subscription(subscription_id)
        return None
    
    @classmethod
    def get_user_subscriptions(cls, user_id: str) -> List[Dict]:
        """Get all subscriptions for a user"""
        if cls.is_available():
            try:
                docs = cls._db.collection('subscriptions').where(
                    'user_id', '==', user_id
                ).stream()
                return [doc.to_dict() for doc in docs]
            except Exception as e:
                print(f"Error getting user subscriptions from Firebase: {e}")
        
        # Fallback to in-memory storage
        if cls._storage:
            return cls._storage.get_user_subscriptions(user_id)
        return []
    
    @classmethod
    def update_subscription(cls, subscription_id: str, subscription_data: Dict) -> bool:
        """Update subscription document"""
        if cls.is_available():
            try:
                cls._db.collection('subscriptions').document(subscription_id).update(subscription_data)
                return True
            except Exception as e:
                print(f"Error updating subscription in Firebase: {e}")
        
        # Fallback to in-memory storage
        if cls._storage:
            return cls._storage.update_subscription(subscription_id, subscription_data)
        return False
    
    @classmethod
    def delete_subscription(cls, subscription_id: str) -> bool:
        """Delete subscription document"""
        if cls.is_available():
            try:
                cls._db.collection('subscriptions').document(subscription_id).delete()
                return True
            except Exception as e:
                print(f"Error deleting subscription from Firebase: {e}")
        
        # Fallback to in-memory storage
        if cls._storage:
            return cls._storage.delete_subscription(subscription_id)
        return False
    
    # Alert operations
    @classmethod
    def create_alert(cls, alert_data: Dict) -> bool:
        """Create alert document"""
        if cls.is_available():
            try:
                cls._db.collection('alerts').document(alert_data['alert_id']).set(alert_data)
                return True
            except Exception as e:
                print(f"Error creating alert in Firebase: {e}")
        
        # Fallback to in-memory storage
        if cls._storage:
            return cls._storage.create_alert(alert_data)
        return False
    
    @classmethod
    def get_user_alerts(cls, user_id: str, unread_only: bool = False) -> List[Dict]:
        """Get alerts for a user"""
        if cls.is_available():
            try:
                query = cls._db.collection('alerts').where('user_id', '==', user_id)
                
                if unread_only:
                    query = query.where('is_read', '==', False)
                
                docs = query.order_by('created_at', direction=firestore.Query.DESCENDING).stream()
                return [doc.to_dict() for doc in docs]
            except Exception as e:
                print(f"Error getting alerts from Firebase: {e}")
        
        # Fallback to in-memory storage
        if cls._storage:
            return cls._storage.get_user_alerts(user_id, unread_only)
        return []
    
    @classmethod
    def mark_alert_as_read(cls, alert_id: str) -> bool:
        """Mark alert as read"""
        if cls.is_available():
            try:
                cls._db.collection('alerts').document(alert_id).update({'is_read': True})
                return True
            except Exception as e:
                print(f"Error marking alert as read in Firebase: {e}")
        
        # Fallback to in-memory storage
        if cls._storage:
            return cls._storage.mark_alert_as_read(alert_id)
        return False
    
    @classmethod
    def delete_alert(cls, alert_id: str) -> bool:
        """Delete alert"""
        if cls.is_available():
            try:
                cls._db.collection('alerts').document(alert_id).delete()
                return True
            except Exception as e:
                print(f"Error deleting alert from Firebase: {e}")
        
        # Fallback to in-memory storage
        if cls._storage:
            return cls._storage.delete_alert(alert_id)
        return False
