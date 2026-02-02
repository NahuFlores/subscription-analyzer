"""
Reusable security decorators
"""
from functools import wraps
from flask import request, jsonify
import logging
from utils.validation import Validator, ValidationError

logger = logging.getLogger(__name__)

def require_user_id(location='args'):
    """
    Decorator to require and validate user_id parameter
    
    Args:
        location: 'args' (query params) or 'json' (request body)
    
    Usage:
        @app.route('/api/data')
        @require_user_id(location='args')
        def get_data():
            user_id = request.validated_user_id
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if location == 'args':
                user_id = request.args.get('user_id')
            elif location == 'json':
                data = request.get_json() or {}
                user_id = data.get('user_id')
            else:
                logger.error(f"Invalid location: {location}")
                return jsonify({
                    'success': False,
                    'error': 'Internal server error'
                }), 500
            
            try:
                validated_id = Validator.validate_user_id(user_id)
                request.validated_user_id = validated_id
                return f(*args, **kwargs)
            except ValidationError as e:
                logger.warning(f"user_id validation failed: {e}")
                return jsonify({
                    'success': False,
                    'error': str(e)
                }), 400
        
        return decorated_function
    return decorator

def verify_ownership(get_resource_func, user_id_field='user_id'):
    """
    Decorator to verify resource ownership
    
    Args:
        get_resource_func: Function to retrieve resource (takes resource_id)
        user_id_field: Field name containing owner's user_id
    
    Usage:
        @app.route('/api/subscriptions/<sub_id>', methods=['DELETE'])
        @require_user_id(location='args')
        @verify_ownership(FirebaseHelper.get_subscription)
        def delete_subscription(sub_id):
            # Ownership already verified
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            requesting_user = getattr(request, 'validated_user_id', None)
            
            if not requesting_user:
                logger.error("verify_ownership used without require_user_id")
                return jsonify({
                    'success': False,
                    'error': 'Unauthorized'
                }), 401
            
            # Get resource ID from URL parameters (assumes first arg)
            resource_id = None
            if kwargs:
                # Flask passes URL variables as kwargs
                resource_id = next(iter(kwargs.values()))
            
            if not resource_id:
                logger.error("No resource ID in request")
                return jsonify({
                    'success': False,
                    'error': 'Resource ID required'
                }), 400
            
            # Get resource
            resource = get_resource_func(resource_id)
            
            if not resource:
                logger.warning(f"Resource {resource_id} not found")
                return jsonify({
                    'success': False,
                    'error': 'Resource not found'
                }), 404
            
            # Verify ownership
            resource_owner = resource.get(user_id_field)
            
            if resource_owner != requesting_user:
                logger.warning(
                    f"User {requesting_user} attempted to access "
                    f"resource {resource_id} owned by {resource_owner}"
                )
                return jsonify({
                    'success': False,
                    'error': 'Forbidden: You do not own this resource'
                }), 403
            
            # Store resource for use in endpoint
            request.verified_resource = resource
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def handle_errors(f):
    """Generic error handler decorator"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValidationError as e:
            logger.warning(f"Validation error in {f.__name__}: {e}")
            return jsonify({'success': False, 'error': str(e)}), 400
        except PermissionError as e:
            logger.warning(f"Permission error in {f.__name__}: {e}")
            return jsonify({'success': False, 'error': str(e)}), 403
        except Exception as e:
            logger.error(
                f"Unexpected error in {f.__name__}: {e}",
                exc_info=True
            )
            return jsonify({
                'success': False,
                'error': 'Internal server error'
            }), 500
    
    return decorated_function
