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
    """Get all subscriptions (delegates to Service Layer)"""
    user_id = request.validated_user_id
    
    logger.info(f"Fetching subscriptions for user: {user_id}")
    
    from services.subscription_service import SubscriptionService
    
    success, result, status_code = SubscriptionService.get_subscriptions(user_id)
    
    return jsonify(result), status_code


@subscription_bp.route('', methods=['POST'])
@require_user_id(location='json')
@handle_errors
def create_subscription():
    """Create a new subscription (delegates to Service Layer)"""
    user_id = request.validated_user_id
    data = request.get_json()
    
    logger.info(f"Create subscription request for user: {user_id}")
    
    # Delegate to Service Layer (Pure Clean Code)
    from services.subscription_service import SubscriptionService
    
    success, result, status_code = SubscriptionService.create_subscription(user_id, data)
    
    return jsonify(result), status_code


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
    """Update a subscription (delegates to Service Layer)"""
    # request.verified_resource is set by @verify_ownership
    existing_data = request.verified_resource
    data = request.get_json()
    
    logger.info(f"Update subscription {subscription_id} request")
    
    from services.subscription_service import SubscriptionService
    
    success, result, status_code = SubscriptionService.update_subscription(
        subscription_id, 
        data, 
        existing_data
    )
    
    return jsonify(result), status_code


@subscription_bp.route('/<subscription_id>', methods=['DELETE'])
@require_user_id(location='args')
@verify_ownership(FirebaseHelper.get_subscription)
@handle_errors
def delete_subscription(subscription_id):
    """Delete a subscription (delegates to Service Layer)"""
    # Ownership already verified by decorator
    logger.info(f"Delete subscription {subscription_id} request")
    
    from services.subscription_service import SubscriptionService
    
    success, result, status_code = SubscriptionService.delete_subscription(subscription_id)
    
    return jsonify(result), status_code


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

