
"""
Firebase helper utilities for database operations
Refactored for Clean Code & Systematic Debugging
"""
import firebase_admin
from firebase_admin import credentials, firestore
from typing import Dict, List, Optional, Any, Callable
import os
import json
import logging
import functools
from google.cloud.firestore_v1.base_query import FieldFilter
from google.api_core import retry, exceptions
from .memory_storage import get_storage

logger = logging.getLogger(__name__)

# Retry policy
DEFAULT_TIMEOUT = 10.0
DEFAULT_RETRY = retry.Retry(
    initial=0.1,
    maximum=2.0,
    multiplier=2.0,
)

def firebase_operation(operation_name: str, fallback_method_name: Optional[str] = None):
    """
    Decorator for safe Firebase operations (Defense in Depth).
    
    Features:
    - Availability check
    - Automatic error handling and logging
    - Input/Output tracing for debugging
    - Automatic fallback to memory storage
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        def wrapper(cls, *args, **kwargs):
            # 1. Tracing Input
            if logger.isEnabledFor(logging.DEBUG):
                logger.debug(f"[Firebase] {operation_name} called with args={args} kwargs={kwargs}")

            # 2. Try Firebase
            if cls.is_available():
                try:
                    result = func(cls, *args, **kwargs)
                    # 3. Tracing Output
                    if logger.isEnabledFor(logging.DEBUG):
                        logger.debug(f"[Firebase] {operation_name} success. Result: {result}")
                    return result
                except Exception as e:
                    logger.error(f"[Firebase] Error in {operation_name}: {e}", exc_info=True)
                    # Proceed to fallback...
            
            # 4. Fallback Strategy
            if fallback_method_name and cls._storage:
                logger.info(f"[Firebase] Falling back to memory for {operation_name}")
                fallback_func = getattr(cls._storage, fallback_method_name, None)
                if fallback_func:
                    try:
                        return fallback_func(*args, **kwargs)
                    except Exception as fb_e:
                        logger.error(f"[Memory] Fallback failed for {operation_name}: {fb_e}")
            
            # 5. Default failures
            logger.warning(f"[Firebase] Operation {operation_name} failed completely.")
            return False if "create" in operation_name or "update" in operation_name or "delete" in operation_name else None

        return wrapper
    return decorator

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
        """Initialize Firebase Admin SDK"""
        if cls._initialized:
            return
        
        # Init fallback storage
        if cls._storage is None:
            cls._storage = get_storage()
            logger.info("In-memory storage initialized as fallback")
        
        try:
            cred = None
            # 1. ENV Var
            credentials_json = os.getenv('FIREBASE_CREDENTIALS')
            if credentials_json:
                try:
                    cred = credentials.Certificate(json.loads(credentials_json))
                    logger.info("Firebase credentials loaded from ENV")
                except json.JSONDecodeError as e:
                    logger.error(f"Error parsing FIREBASE_CREDENTIALS JSON: {e}")
            
            # 2. File Path
            if cred is None and credentials_path and os.path.exists(credentials_path):
                cred = credentials.Certificate(credentials_path)
                logger.info("Firebase credentials loaded from file")
            
            if cred:
                firebase_admin.initialize_app(cred)
                cls._db = firestore.client()
                logger.info("Firebase initialized successfully")
            else:
                logger.warning("Running without Firebase credentials (demo mode)")
            
            cls._initialized = True
            
        except Exception as e:
            logger.error(f"Error initializing Firebase: {e}")
            cls._initialized = True
    
    @classmethod
    def get_db(cls):
        if not cls._initialized:
            cls.initialize()
        return cls._db
    
    @classmethod
    def is_available(cls) -> bool:
        return cls._db is not None
    
    # --- User Operations ---
    
    @classmethod
    @firebase_operation("create_user", "create_user")
    def create_user(cls, user_data: Dict) -> bool:
        cls._db.collection('users').document(user_data['user_id']).set(user_data)
        return True
    
    @classmethod
    @firebase_operation("get_user", "get_user")
    def get_user(cls, user_id: str) -> Optional[Dict]:
        doc = cls._db.collection('users').document(user_id).get()
        return doc.to_dict() if doc.exists else None
    
    @classmethod
    @firebase_operation("update_user", "update_user")
    def update_user(cls, user_id: str, user_data: Dict) -> bool:
        cls._db.collection('users').document(user_id).update(user_data)
        return True
    
    # --- Subscription Operations ---
    
    @classmethod
    @firebase_operation("create_subscription", "create_subscription")
    def create_subscription(cls, subscription_data: Dict) -> bool:
        cls._db.collection('subscriptions').document(
            subscription_data['subscription_id']
        ).set(subscription_data)
        return True
    
    @classmethod
    @firebase_operation("get_subscription", "get_subscription")
    def get_subscription(cls, subscription_id: str) -> Optional[Dict]:
        doc = cls._db.collection('subscriptions').document(subscription_id).get()
        return doc.to_dict() if doc.exists else None

    @classmethod
    def get_user_subscriptions(cls, user_id: str) -> List[Dict]:
        """
        Special case: Needs explicit timeout and specific query logic.
        Still uses internal try/catch for specific query handling but leverages logging.
        """
        if not user_id: 
            return []
            
        if cls.is_available():
            try:
                # Use query with timeout
                docs = cls._db.collection('subscriptions').where(
                     filter=FieldFilter('user_id', '==', user_id)
                ).stream(timeout=DEFAULT_TIMEOUT, retry=DEFAULT_RETRY)
                return [doc.to_dict() for doc in docs]
            except Exception as e:
                logger.error(f"Error getting user subscriptions: {e}")
        
        # Fallback
        if cls._storage:
            return cls._storage.get_user_subscriptions(user_id)
        return []

    @classmethod
    @firebase_operation("update_subscription", "update_subscription")
    def update_subscription(cls, subscription_id: str, subscription_data: Dict) -> bool:
        cls._db.collection('subscriptions').document(subscription_id).update(subscription_data)
        return True
    
    @classmethod
    @firebase_operation("delete_subscription", "delete_subscription")
    def delete_subscription(cls, subscription_id: str) -> bool:
        cls._db.collection('subscriptions').document(subscription_id).delete()
        return True

    # --- Alert Operations ---

    @classmethod
    @firebase_operation("create_alert", "create_alert")
    def create_alert(cls, alert_data: Dict) -> bool:
        cls._db.collection('alerts').document(alert_data['alert_id']).set(alert_data)
        return True
    
    @classmethod
    @firebase_operation("get_user_alerts", "get_user_alerts")
    def get_user_alerts(cls, user_id: str, unread_only: bool = False) -> List[Dict]:
        query = cls._db.collection('alerts').where('user_id', '==', user_id)
        if unread_only:
            query = query.where('is_read', '==', False)
        docs = query.order_by('created_at', direction=firestore.Query.DESCENDING).stream()
        return [doc.to_dict() for doc in docs]
    
    @classmethod
    @firebase_operation("mark_alert_as_read", "mark_alert_as_read")
    def mark_alert_as_read(cls, alert_id: str) -> bool:
        cls._db.collection('alerts').document(alert_id).update({'is_read': True})
        return True
    
    @classmethod
    @firebase_operation("delete_alert", "delete_alert")
    def delete_alert(cls, alert_id: str) -> bool:
        cls._db.collection('alerts').document(alert_id).delete()
        return True
