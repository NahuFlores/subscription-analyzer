"""
Subscription Service - Business Logic Layer
Handles validation, data processing, and database interactions for subscriptions.
Refactored for Clean Code (SRP).
"""
import logging
from typing import Dict, Tuple, Optional
from datetime import datetime
from models import SubscriptionFactory, Category
from utils import FirebaseHelper
from utils.validation import Validator

logger = logging.getLogger(__name__)

class SubscriptionService:
    """
    Service class to handle subscription logic.
    Decouples routes from database and validation details.
    """

    @staticmethod
    def create_subscription(user_id: str, data: Dict) -> Tuple[bool, Dict, int]:
        """
        Create a new subscription with full validation.
        
        Returns:
            Tuple: (success, result_dict, status_code)
        """
        try:
            # 1. Validate Inputs
            name = Validator.sanitize_string(data.get('name'), 'name', max_length=100)
            cost = Validator.validate_number(data.get('cost'), 'cost', min_val=0, max_val=10000)
            
            billing_cycle = Validator.validate_choice(
                data.get('billing_cycle'),
                ['monthly', 'annual', 'custom'],
                'billing_cycle'
            )
            
            start_date = Validator.validate_datetime(
                data.get('start_date'), 
                'start_date',
                allow_future=True
            )
            
            # 2. Logic: Auto-categorize if needed
            category = data.get('category')
            if category:
                category = Validator.sanitize_string(category, 'category', max_length=50)
            else:
                category = Category.auto_categorize(name)
                
            notes = data.get('notes', '')
            if notes:
                notes = Validator.sanitize_string(notes, 'notes', max_length=500)
            
            # 3. Logic: Handle Custom Days
            custom_days = None
            if billing_cycle == 'custom':
                custom_days = int(Validator.validate_number(
                    data.get('custom_days'), 
                    'custom_days', 
                    min_val=1, 
                    max_val=365
                ))

            # 4. Construct Subscription Object
            subscription_params = {
                'billing_cycle': billing_cycle,
                'user_id': user_id,
                'name': name,
                'cost': cost,
                'start_date': start_date,
                'category': category,
                'notes': notes
            }
            
            if custom_days:
                subscription_params['custom_days'] = custom_days
            
            subscription = SubscriptionFactory.create_subscription(**subscription_params)
            
            # 5. Persist
            success = FirebaseHelper.create_subscription(subscription.to_dict())
            
            if success:
                logger.info(f"Service: Created subscription {subscription.subscription_id}")
                return True, {
                    'success': True,
                    'subscription': subscription.to_dict(),
                    'message': 'Subscription created successfully'
                }, 201
            else:
                logger.error("Service: Failed to save subscription")
                return False, {
                    'success': False,
                    'message': 'Failed to save subscription'
                }, 500
                
        except ValueError as e:
            logger.warning(f"Service: Validation error: {e}")
            return False, {'error': str(e)}, 400
        except Exception as e:
            logger.error(f"Service: Unexpected error: {e}", exc_info=True)
            return False, {'error': 'Internal server error processing subscription'}, 500

    @staticmethod
    def get_subscriptions(user_id: str) -> Tuple[bool, Dict, int]:
        """
        Get all subscriptions for a user.
        """
        try:
            # 1. Fetch from Data Layer
            subscriptions_data = FirebaseHelper.get_user_subscriptions(user_id)
            
            # 2. Logic: Convert to Objects (DTOs)
            subscriptions = []
            for data in subscriptions_data:
                try:
                    sub = SubscriptionFactory.from_dict(data)
                    subscriptions.append(sub.to_dict())
                except Exception as e:
                    logger.error(f"Service: Error converting subscription data: {e}")
                    # Continue with valid subscriptions is the resilient choice
            
            return True, {
                'success': True,
                'subscriptions': subscriptions,
                'count': len(subscriptions)
            }, 200
            
        except Exception as e:
            logger.error(f"Service: Error fetching subscriptions: {e}", exc_info=True)
            return False, {'error': 'Failed to fetch subscriptions'}, 500

    @staticmethod
    def update_subscription(subscription_id: str, data: Dict, existing_data: Dict) -> Tuple[bool, Dict, int]:
        """
        Update an existing subscription.
        Existing data is passed in (usually from verify_ownership decorator).
        """
        try:
            # 1. Update fields with validation
            if 'cost' in data:
                existing_data['cost'] = Validator.validate_number(data['cost'], 'cost', min_val=0)
            
            if 'name' in data:
                existing_data['name'] = Validator.sanitize_string(data['name'], 'name', max_length=100)
                
            if 'category' in data:
                existing_data['category'] = Validator.sanitize_string(data['category'], 'category', max_length=50)
                
            if 'is_active' in data:
                existing_data['is_active'] = bool(data['is_active'])
                
            if 'notes' in data:
                 existing_data['notes'] = Validator.sanitize_string(data['notes'], 'notes', max_length=500)
            
            # 2. Update Timestamp
            existing_data['updated_at'] = datetime.now().isoformat()
            
            # 3. Persist
            success = FirebaseHelper.update_subscription(subscription_id, existing_data)
            
            if success:
                subscription = SubscriptionFactory.from_dict(existing_data)
                logger.info(f"Service: Updated subscription {subscription_id}")
                return True, {
                    'success': True,
                    'subscription': subscription.to_dict(),
                    'message': 'Subscription updated successfully'
                }, 200
            else:
                return False, {
                    'success': False,
                    'message': 'Failed to update subscription'
                }, 500
                
        except ValueError as e:
            logger.warning(f"Service: Validation error in update: {e}")
            return False, {'error': str(e)}, 400
        except Exception as e:
            logger.error(f"Service: Error updating subscription: {e}", exc_info=True)
            return False, {'error': 'Internal server error'}, 500

    @staticmethod
    def delete_subscription(subscription_id: str) -> Tuple[bool, Dict, int]:
        """
        Delete a subscription.
        """
        try:
            success = FirebaseHelper.delete_subscription(subscription_id)
            
            if success:
                logger.info(f"Service: Deleted subscription {subscription_id}")
                return True, {
                    'success': True,
                    'message': 'Subscription deleted successfully'
                }, 200
            else:
                return False, {
                    'success': False,
                    'message': 'Failed to delete subscription'
                }, 500
                
        except Exception as e:
            logger.error(f"Service: Error deleting subscription: {e}", exc_info=True)
            return False, {'error': 'Internal server error'}, 500
