"""
Analytics routes - API endpoints for data analysis and insights
"""
from flask import Blueprint, request, jsonify
from models import SubscriptionFactory, User
from analytics import SubscriptionAnalyzer, CostPredictor
from utils import FirebaseHelper
import logging

logger = logging.getLogger(__name__)
analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')


def _get_user_objects(user_id: str) -> tuple[list, User]:
    """
    Helper to fetch and convert subscriptions and user data
    Returns: (subscriptions_list, user_object)
    """
    # Get user subscriptions
    subscriptions_data = FirebaseHelper.get_user_subscriptions(user_id)
    subscriptions = [SubscriptionFactory.from_dict(data) for data in subscriptions_data]
    
    # Get user data
    user_data = FirebaseHelper.get_user(user_id)
    user = User.from_dict(user_data) if user_data else User(user_id, 'user@example.com', 'User')
    
    return subscriptions, user


@analytics_bp.route('/summary', methods=['GET'])
def get_summary():
    """Get comprehensive analytics summary"""
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    try:
        subscriptions, user = _get_user_objects(user_id)
        
        if not subscriptions:
            return jsonify({
                'success': True,
                'message': 'No subscriptions found',
                'analytics': {}
            }), 200
        
        # Create analyzer
        analyzer = SubscriptionAnalyzer(subscriptions, user)
        
        return jsonify({
            'success': True,
            'analytics': analyzer.export_to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_summary: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/predictions', methods=['GET'])
def get_predictions():
    """Get cost predictions using ML"""
    user_id = request.args.get('user_id')
    months = int(request.args.get('months', 6))
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    try:
        subscriptions, _ = _get_user_objects(user_id)
        
        if not subscriptions:
            return jsonify({
                'success': True,
                'message': 'No subscriptions for predictions',
                'predictions': {}
            }), 200
        
        # Create predictor
        predictor = CostPredictor(subscriptions)
        
        return jsonify({
            'success': True,
            'predictions': predictor.predict_future_costs(months),
            'clusters': predictor.cluster_subscriptions(),
            'efficiency': predictor.calculate_cost_efficiency()
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_predictions: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/charts', methods=['GET'])
def get_charts():
    """Get chart data for visualizations (Recharts format)"""
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    try:
        subscriptions, user = _get_user_objects(user_id)
        
        if not subscriptions:
            return jsonify({
                'success': True,
                'message': 'No data for charts',
                'charts': {}
            }), 200
        
        # Compute analytics and predictions
        analyzer = SubscriptionAnalyzer(subscriptions, user)
        analytics_data = analyzer.export_to_dict()
        
        predictor = CostPredictor(subscriptions)
        predictions = predictor.predict_future_costs(6)
        
        charts_data = {
            'category_costs': analytics_data.get('cost_by_category', {}),
            'billing_cycle_costs': analytics_data.get('cost_by_billing_cycle', {}),
            'category_distribution': analytics_data.get('category_distribution', {}),
            'upcoming_payments': analytics_data.get('upcoming_payments', []),
            'cost_predictions': predictions.get('predictions', [])
        }
        
        return jsonify({
            'success': True,
            'charts': charts_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_charts: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/insights', methods=['GET'])
def get_insights():
    """Get AI-powered insights and recommendations"""
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    try:
        subscriptions, user = _get_user_objects(user_id)
        
        if not subscriptions:
            return jsonify({
                'success': True,
                'message': 'No subscriptions for insights',
                'insights': []
            }), 200
        
        analyzer = SubscriptionAnalyzer(subscriptions, user)
        predictor = CostPredictor(subscriptions)
        
        # Collect insights
        insights = []
        
        # 1. Cost anomalies
        if anomalies := analyzer.detect_cost_anomalies():
            insights.append({
                'type': 'warning',
                'title': 'Unusually High Costs Detected',
                'message': f'Found {len(anomalies)} subscription(s) with costs significantly above average',
                'data': anomalies
            })
        
        # 2. Potential savings
        savings = analyzer.calculate_potential_savings()
        if savings['total_potential_monthly_savings'] > 0:
            insights.append({
                'type': 'success',
                'title': 'Savings Opportunity',
                'message': f'You could save ${savings["total_potential_monthly_savings"]:.2f}/month',
                'data': savings
            })
        
        # 3. Unused subscriptions
        if unused := predictor.detect_unused_subscriptions():
            insights.append({
                'type': 'info',
                'title': 'Review These Subscriptions',
                'message': f'{len(unused)} subscription(s) might be underutilized',
                'data': unused
            })
        
        # 4. Upcoming payments
        if upcoming := analyzer.get_upcoming_payments(7):
            total_upcoming = sum(p['cost'] for p in upcoming)
            insights.append({
                'type': 'info',
                'title': 'Upcoming Payments',
                'message': f'${total_upcoming:.2f} in payments due in the next 7 days',
                'data': upcoming
            })
        
        return jsonify({
            'success': True,
            'insights': insights,
            'count': len(insights)
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_insights: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/report', methods=['GET'])
def generate_report():
    """Generate static analysis report with visualizations"""
    user_id = request.args.get('user_id')
    report_type = request.args.get('type', 'all')
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    try:
        from analytics import ReportGenerator
        
        subscriptions, _ = _get_user_objects(user_id)
        
        if not subscriptions:
            return jsonify({
                'success': True,
                'message': 'No subscriptions for report',
                'plots': {}
            }), 200
        
        report_gen = ReportGenerator(subscriptions)
        plots = {}
        
        if report_type in ['all', 'category']:
            plots['category_distribution'] = report_gen.create_category_distribution_plot()
        
        if report_type in ['all', 'cost']:
            plots['cost_analysis'] = report_gen.create_cost_analysis_plot()
        
        if report_type in ['all', 'stats']:
            plots['statistical_summary'] = report_gen.create_statistical_summary_plot()
        
        if report_type in ['all', 'correlation']:
            plots['correlation_heatmap'] = report_gen.create_correlation_heatmap()
        
        return jsonify({
            'success': True,
            'plots': plots,
            'message': f'Generated {len(plots)} visualization(s)'
        }), 200
        
    except Exception as e:
        logger.error(f"Error in generate_report: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500
