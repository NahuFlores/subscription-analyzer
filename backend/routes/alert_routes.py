"""
Alert routes - API endpoints for notification alerts
"""
from flask import Blueprint, request, jsonify
import logging
from utils.decorators import require_user_id, handle_errors

logger = logging.getLogger(__name__)
alerts_bp = Blueprint('alerts', __name__, url_prefix='/api/alerts')


@alerts_bp.route('', methods=['GET'])
@require_user_id(location='args')
@handle_errors
def get_alerts():
    """Generate and return alerts for a user"""
    user_id = request.validated_user_id

    logger.info(f"Generating alerts for user: {user_id}")

    from services.alert_service import AlertService
    result = AlertService.generate_alerts(user_id)

    return jsonify(result), 200
