"""
AI Routes - Endpoints for LLM-based analysis (e.g., using Groq/Llama)
Distinct from deterministic analytics in analytics_routes.py
"""
from flask import Blueprint, jsonify, request
from models import Subscription, User
from analytics.ai_advisor import AIAdvisor
from analytics.analyzer import SubscriptionAnalyzer
import logging

ai_bp = Blueprint('ai', __name__)
logger = logging.getLogger(__name__)

# Initialize Advisor (lazy loading handled in class)
advisor = AIAdvisor()

@ai_bp.route('/analyze', methods=['POST'])
def analyze_portfolio():
    """
    Generate AI insights using LLM.
    Combines hard statistics with AI qualitative analysis.
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
            
        # Fetch real data from DB
        from utils import FirebaseHelper
        from models import SubscriptionFactory
        
        user_data = FirebaseHelper.get_user(user_id)
        
        # If user doesn't exist in DB (e.g. fresh frontend session), create a temporary user object
        if user_data:
            user = User.from_dict(user_data)
        else:
            # Create temp user for analysis
            user = User(user_id=user_id, email='guest@example.com', name='Guest User')
            
        subscriptions_data = FirebaseHelper.get_user_subscriptions(user_id)
        subscriptions = [SubscriptionFactory.from_dict(sub) for sub in subscriptions_data]
        
        # Use Analyzer for hard math
        analyzer = SubscriptionAnalyzer(subscriptions, user)
        stats = analyzer.get_statistics()
        total_cost = stats.get('total_monthly_cost', 0)
        
        # Format subs for AI
        subs_list = [{
            'name': s.name, 
            'cost': float(s.cost), 
            'billing_cycle': s.get_billing_cycle(),
            'category': s.category
        } for s in subscriptions]
        
        # Get AI Insights
        ai_response = advisor.generate_insights(subs_list, total_cost)
        
        return jsonify(ai_response)
        
    except Exception as e:
        logger.error(f"AI Route Error: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500
