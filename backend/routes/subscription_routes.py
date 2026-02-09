"""
Subscription routes - API endpoints for subscription management
"""
from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
import logging
from models import SubscriptionFactory
from utils import FirebaseHelper
from utils.validation import Validator, ValidationError
from utils.decorators import require_user_id, verify_ownership, handle_errors

logger = logging.getLogger(__name__)
subscription_bp = Blueprint('subscriptions', __name__, url_prefix='/api/subscriptions')


@subscription_bp.route('', methods=['GET'])
@require_user_id(location='args')
@handle_errors
def get_subscriptions():
    """Get all subscriptions for a user"""
    user_id = request.validated_user_id
    
    logger.info(f"Fetching subscriptions for user: {user_id}")
    
    # Get subscriptions from Firebase
    subscriptions_data = FirebaseHelper.get_user_subscriptions(user_id)
    
    # Convert to subscription objects
    subscriptions = []
    for data in subscriptions_data:
        try:
            sub = SubscriptionFactory.from_dict(data)
            subscriptions.append(sub.to_dict())
        except Exception as e:
            logger.error(f"Error converting subscription data: {e}")
            # Continue with valid subscriptions
    
    return jsonify({
        'success': True,
        'subscriptions': subscriptions,
        'count': len(subscriptions)
    }), 200


@subscription_bp.route('', methods=['POST'])
@require_user_id(location='json')
@handle_errors
def create_subscription():
    """Create a new subscription with strict validation"""
    user_id = request.validated_user_id
    data = request.get_json()
    
    logger.info(f"Create subscription request for user: {user_id}")
    
    # Validate Inputs
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
    
    # Optional fields
    category = data.get('category')
    if category:
        category = Validator.sanitize_string(category, 'category', max_length=50)
    else:
        # Auto-categorize
        from models import Category
        category = Category.auto_categorize(name)
        
    notes = data.get('notes', '')
    if notes:
        notes = Validator.sanitize_string(notes, 'notes', max_length=500)
    
    # Handle custom days
    custom_days = None
    if billing_cycle == 'custom':
        custom_days = int(Validator.validate_number(
            data.get('custom_days'), 
            'custom_days', 
            min_val=1, 
            max_val=365
        ))

    # Create & Save
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
    success = FirebaseHelper.create_subscription(subscription.to_dict())
    
    if success:
        logger.info(f"Successfully created subscription {subscription.subscription_id}")
        return jsonify({
            'success': True,
            'subscription': subscription.to_dict(),
            'message': 'Subscription created successfully'
        }), 201
    else:
        logger.error("Failed to save subscription to Firebase")
        return jsonify({
            'success': False,
            'message': 'Failed to save subscription'
        }), 500


@subscription_bp.route('/<subscription_id>', methods=['GET'])
@handle_errors
def get_subscription(subscription_id):
    """Get a specific subscription"""
    subscription_data = FirebaseHelper.get_subscription(subscription_id)
    
    if not subscription_data:
        return jsonify({'error': 'Subscription not found'}), 404
    
    subscription = SubscriptionFactory.from_dict(subscription_data)
    
    return jsonify({
        'success': True,
        'subscription': subscription.to_dict()
    }), 200


@subscription_bp.route('/<subscription_id>', methods=['PUT'])
@require_user_id(location='json')
@verify_ownership(FirebaseHelper.get_subscription)
@handle_errors
def update_subscription(subscription_id):
    """Update a subscription with ownership verification"""
    # request.verified_resource is set by @verify_ownership
    existing_data = request.verified_resource
    data = request.get_json()
    
    logger.info(f"Update subscription {subscription_id} request")
    
    # Update fields with validation
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
    
    # Update timestamp
    existing_data['updated_at'] = datetime.now().isoformat()
    
    # Save to Firebase
    success = FirebaseHelper.update_subscription(subscription_id, existing_data)
    
    if success:
        subscription = SubscriptionFactory.from_dict(existing_data)
        logger.info(f"Successfully updated subscription {subscription_id}")
        return jsonify({
            'success': True,
            'subscription': subscription.to_dict(),
            'message': 'Subscription updated successfully'
        }), 200
    else:
        return jsonify({
            'success': False,
            'message': 'Failed to update subscription'
        }), 500


@subscription_bp.route('/<subscription_id>', methods=['DELETE'])
@require_user_id(location='args')
@verify_ownership(FirebaseHelper.get_subscription)
@handle_errors
def delete_subscription(subscription_id):
    """Delete a subscription with ownership verification"""
    # Ownership already verified by decorator
    logger.info(f"Delete subscription {subscription_id} request")
    
    success = FirebaseHelper.delete_subscription(subscription_id)
    
    if success:
        logger.info(f"Successfully deleted subscription {subscription_id}")
        return jsonify({
            'success': True,
            'message': 'Subscription deleted successfully'
        }), 200
    else:
        return jsonify({
            'success': False,
            'message': 'Failed to delete subscription'
        }), 500


@subscription_bp.route('/seed-demo', methods=['POST'])
@handle_errors
def seed_demo_data():
    """Seed demo data for a user (or demo_user if not specified)"""
    from utils.demo_seed import seed_demo_data as do_seed, DEMO_USER_ID
    
    # Get user_id from request body or query params
    data = request.get_json(silent=True) or {}
    user_id = data.get('user_id') or request.args.get('user_id') or DEMO_USER_ID
    
    logger.info(f"Seeding demo data for user: {user_id}")
    result = do_seed(user_id=user_id, clear_existing=True)
    
    return jsonify({
        'success': result['success'],
        'message': f"Created {result['created']} demo subscriptions",
        'user_id': result['user_id'],
        'created': result['created'],
        'cleared': result.get('cleared', 0),
        'errors': result['errors'] if result['errors'] else None
    }), 201 if result['success'] else 500


@subscription_bp.route('/clear-demo', methods=['DELETE'])
@handle_errors
def clear_demo_data():
    """Clear demo data"""
    from utils.demo_seed import DEMO_USER_ID
    
    logger.info("Clearing demo data")
    
    # Get and delete all demo user subscriptions
    subscriptions = FirebaseHelper.get_user_subscriptions(DEMO_USER_ID)
    deleted = 0
    
    for sub in subscriptions:
        if FirebaseHelper.delete_subscription(sub.get('subscription_id')):
            deleted += 1
    
    return jsonify({
        'success': True,
        'message': f"Deleted {deleted} demo subscriptions",
        'deleted': deleted
    }), 200

