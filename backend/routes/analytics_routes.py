"""
Analytics routes - API endpoints for data analysis and insights
"""
from flask import Blueprint, request, jsonify
from models import SubscriptionFactory, User
from analytics import SubscriptionAnalyzer, CostPredictor
from utils import FirebaseHelper

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')


@analytics_bp.route('/summary', methods=['GET'])
def get_summary():
    """Get comprehensive analytics summary"""
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    try:
        # Get user subscriptions
        subscriptions_data = FirebaseHelper.get_user_subscriptions(user_id)
        
        if not subscriptions_data:
            return jsonify({
                'success': True,
                'message': 'No subscriptions found',
                'analytics': {}
            }), 200
        
        # Convert to subscription objects
        subscriptions = [SubscriptionFactory.from_dict(data) for data in subscriptions_data]
        
        # Get user data
        user_data = FirebaseHelper.get_user(user_id)
        user = User.from_dict(user_data) if user_data else User(user_id, 'user@example.com', 'User')
        
        # Create analyzer
        analyzer = SubscriptionAnalyzer(subscriptions, user)
        
        # Get all analytics
        analytics = analyzer.export_to_dict()
        
        return jsonify({
            'success': True,
            'analytics': analytics
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/predictions', methods=['GET'])
def get_predictions():
    """Get cost predictions using ML"""
    user_id = request.args.get('user_id')
    months = int(request.args.get('months', 6))
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    try:
        # Get subscriptions
        subscriptions_data = FirebaseHelper.get_user_subscriptions(user_id)
        subscriptions = [SubscriptionFactory.from_dict(data) for data in subscriptions_data]
        
        if not subscriptions:
            return jsonify({
                'success': True,
                'message': 'No subscriptions for predictions',
                'predictions': {}
            }), 200
        
        # Create predictor
        predictor = CostPredictor(subscriptions)
        
        # Get predictions
        predictions = predictor.predict_future_costs(months)
        
        # Get clustering
        clusters = predictor.cluster_subscriptions()
        
        # Get efficiency metrics
        efficiency = predictor.calculate_cost_efficiency()
        
        return jsonify({
            'success': True,
            'predictions': predictions,
            'clusters': clusters,
            'efficiency': efficiency
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/charts', methods=['GET'])
def get_charts():
    """
    Get chart data for visualizations (Recharts format)
    Frontend uses Recharts, so we return raw data instead of Plotly JSON
    """
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    try:
        # Get subscriptions
        subscriptions_data = FirebaseHelper.get_user_subscriptions(user_id)
        subscriptions = [SubscriptionFactory.from_dict(data) for data in subscriptions_data]
        
        if not subscriptions:
            return jsonify({
                'success': True,
                'message': 'No data for charts',
                'charts': {}
            }), 200
        
        # Get user
        user_data = FirebaseHelper.get_user(user_id)
        user = User.from_dict(user_data) if user_data else User(user_id, 'user@example.com', 'User')
        
        # Create analyzer
        analyzer = SubscriptionAnalyzer(subscriptions, user)
        
        # Get analytics data
        analytics_data = analyzer.export_to_dict()
        
        # Get predictions for trend chart
        predictor = CostPredictor(subscriptions)
        predictions = predictor.predict_future_costs(6)
        
        # Format data for Recharts (frontend will handle visualization)
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
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/insights', methods=['GET'])
def get_insights():
    """Get AI-powered insights and recommendations"""
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    try:
        # Get subscriptions
        subscriptions_data = FirebaseHelper.get_user_subscriptions(user_id)
        subscriptions = [SubscriptionFactory.from_dict(data) for data in subscriptions_data]
        
        if not subscriptions:
            return jsonify({
                'success': True,
                'message': 'No subscriptions for insights',
                'insights': []
            }), 200
        
        # Get user
        user_data = FirebaseHelper.get_user(user_id)
        user = User.from_dict(user_data) if user_data else User(user_id, 'user@example.com', 'User')
        
        # Create analyzer and predictor
        analyzer = SubscriptionAnalyzer(subscriptions, user)
        predictor = CostPredictor(subscriptions)
        
        # Collect insights
        insights = []
        
        # 1. Cost anomalies
        anomalies = analyzer.detect_cost_anomalies()
        if anomalies:
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
        unused = predictor.detect_unused_subscriptions()
        if unused:
            insights.append({
                'type': 'info',
                'title': 'Review These Subscriptions',
                'message': f'{len(unused)} subscription(s) might be underutilized',
                'data': unused
            })
        
        # 4. Upcoming payments
        upcoming = analyzer.get_upcoming_payments(7)
        if upcoming:
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
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/report', methods=['GET'])
def generate_report():
    """
    Generate static analysis report with matplotlib/seaborn visualizations
    Used for academic demonstration and PDF exports
    """
    user_id = request.args.get('user_id')
    report_type = request.args.get('type', 'all')  # 'all', 'category', 'cost', 'stats', 'correlation'
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    try:
        from analytics import ReportGenerator
        
        # Get subscriptions
        subscriptions_data = FirebaseHelper.get_user_subscriptions(user_id)
        subscriptions = [SubscriptionFactory.from_dict(data) for data in subscriptions_data]
        
        if not subscriptions:
            return jsonify({
                'success': True,
                'message': 'No subscriptions for report',
                'plots': {}
            }), 200
        
        # Create report generator
        report_gen = ReportGenerator(subscriptions)
        
        # Generate requested plots (as base64 images)
        plots = {}
        
        if report_type == 'all' or report_type == 'category':
            plots['category_distribution'] = report_gen.create_category_distribution_plot()
        
        if report_type == 'all' or report_type == 'cost':
            plots['cost_analysis'] = report_gen.create_cost_analysis_plot()
        
        if report_type == 'all' or report_type == 'stats':
            plots['statistical_summary'] = report_gen.create_statistical_summary_plot()
        
        if report_type == 'all' or report_type == 'correlation':
            plots['correlation_heatmap'] = report_gen.create_correlation_heatmap()
        
        return jsonify({
            'success': True,
            'plots': plots,
            'message': f'Generated {len(plots)} visualization(s) using matplotlib/seaborn'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
