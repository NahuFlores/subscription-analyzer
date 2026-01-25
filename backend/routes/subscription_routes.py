"""
Subscription routes - API endpoints for subscription management
"""
from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from models import SubscriptionFactory
from utils import FirebaseHelper

subscription_bp = Blueprint('subscriptions', __name__, url_prefix='/api/subscriptions')


@subscription_bp.route('', methods=['GET'])
def get_subscriptions():
    """Get all subscriptions for a user"""
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    try:
        # Get subscriptions from Firebase
        subscriptions_data = FirebaseHelper.get_user_subscriptions(user_id)
        
        # Convert to subscription objects and back to dict for response
        subscriptions = []
        for data in subscriptions_data:
            sub = SubscriptionFactory.from_dict(data)
            subscriptions.append(sub.to_dict())
        
        return jsonify({
            'success': True,
            'subscriptions': subscriptions,
            'count': len(subscriptions)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@subscription_bp.route('', methods=['POST'])
def create_subscription():
    """Create a new subscription"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['user_id', 'name', 'cost', 'billing_cycle', 'start_date']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        # Parse start_date
        data['start_date'] = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
        
        # Auto-categorize if category not provided
        if 'category' not in data or not data['category']:
            from models import Category
            data['category'] = Category.auto_categorize(data['name'])
        
        # Create subscription object
        subscription_params = {
            'billing_cycle': data['billing_cycle'],
            'user_id': data['user_id'],
            'name': data['name'],
            'cost': float(data['cost']),
            'start_date': data['start_date'],
            'category': data.get('category', 'Other'),
            'notes': data.get('notes', '')
        }
        
        # Only add custom_days for custom billing cycle
        if data['billing_cycle'] == 'custom':
            subscription_params['custom_days'] = data.get('custom_days', 30)
        
        subscription = SubscriptionFactory.create_subscription(**subscription_params)
        
        # Save to Firebase
        success = FirebaseHelper.create_subscription(subscription.to_dict())
        
        if success:
            return jsonify({
                'success': True,
                'subscription': subscription.to_dict(),
                'message': 'Subscription created successfully'
            }), 201
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to save subscription (Firebase not available)'
            }), 500
            
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"ERROR creating subscription: {str(e)}")
        print(f"Traceback: {error_details}")
        return jsonify({
            'error': str(e),
            'details': error_details if current_app.debug else 'Internal server error'
        }), 500


@subscription_bp.route('/<subscription_id>', methods=['GET'])
def get_subscription(subscription_id):
    """Get a specific subscription"""
    try:
        subscription_data = FirebaseHelper.get_subscription(subscription_id)
        
        if not subscription_data:
            return jsonify({'error': 'Subscription not found'}), 404
        
        subscription = SubscriptionFactory.from_dict(subscription_data)
        
        return jsonify({
            'success': True,
            'subscription': subscription.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@subscription_bp.route('/<subscription_id>', methods=['PUT'])
def update_subscription(subscription_id):
    """Update a subscription"""
    data = request.get_json()
    
    try:
        # Get existing subscription
        existing_data = FirebaseHelper.get_subscription(subscription_id)
        
        if not existing_data:
            return jsonify({'error': 'Subscription not found'}), 404
        
        # Update fields
        if 'cost' in data:
            existing_data['cost'] = float(data['cost'])
        if 'name' in data:
            existing_data['name'] = data['name']
        if 'category' in data:
            existing_data['category'] = data['category']
        if 'is_active' in data:
            existing_data['is_active'] = data['is_active']
        if 'notes' in data:
            existing_data['notes'] = data['notes']
        
        # Update timestamp
        existing_data['updated_at'] = datetime.now().isoformat()
        
        # Save to Firebase
        success = FirebaseHelper.update_subscription(subscription_id, existing_data)
        
        if success:
            subscription = SubscriptionFactory.from_dict(existing_data)
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
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@subscription_bp.route('/<subscription_id>', methods=['DELETE'])
def delete_subscription(subscription_id):
    """Delete a subscription"""
    try:
        success = FirebaseHelper.delete_subscription(subscription_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Subscription deleted successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to delete subscription'
            }), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
