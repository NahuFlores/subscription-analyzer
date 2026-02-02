"""
ML Predictor - Machine Learning module for cost predictions
Uses Scikit-learn for predictive analytics
"""
import logging
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from models import Subscription
from config import AnalyticsConfig

logger = logging.getLogger(__name__)

def sanitize_for_json(obj: Any) -> Any:
    """Replace NaN and Infinity with None/0.0 for JSON serialization"""
    if isinstance(obj, float):
        if np.isnan(obj) or np.isinf(obj):
            return 0.0
    elif isinstance(obj, dict):
        return {k: sanitize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_for_json(item) for item in obj]
    return obj


class CostPredictor:
    """
    ML predictor for subscription costs using Linear Regression.
    """
    
    def __init__(self, subscriptions: List[Subscription]):
        if subscriptions is None:
            raise ValueError("Subscriptions list cannot be None")
            
        self.subscriptions = subscriptions
        self.model = LinearRegression()
        self.scaler = StandardScaler()
    
    def _get_active_subscriptions(self) -> List[Subscription]:
        """Helper to get only active subscriptions"""
        return [sub for sub in self.subscriptions if sub.is_active]

    def predict_future_costs(self, months_ahead: int = 6) -> Dict:
        """
        Predict future monthly costs using simulated realistic trends.
        """
        try:
            active_subs = self._get_active_subscriptions()
            if not active_subs:
                return {'predictions': [], 'trend': 'stable'}
            
            # Calculate base monthly cost
            base_monthly = sum(sub.calculate_annual_cost() / 12 for sub in active_subs)
            
            # Configuration
            historical_months = AnalyticsConfig.ML_PREDICTION_MONTHS
            total_months = historical_months + months_ahead
            
            # Create curves using sine wave + slight upward trend + noise
            np.random.seed(AnalyticsConfig.RANDOM_SEED)
            
            # Time points
            t = np.linspace(0, total_months, total_months)
            
            # 1. Base trend
            trend = np.linspace(0, base_monthly * AnalyticsConfig.PREDICTION_TREND_SLOPE, total_months)
            
            # 2. Seasonality
            amplitude = base_monthly * AnalyticsConfig.SEASONALITY_AMPLITUDE_RATIO
            seasonality = amplitude * np.sin(t * 0.8)
            
            # 3. Random noise
            noise = np.random.normal(0, base_monthly * AnalyticsConfig.NOISE_RATIO, total_months)
            
            # Combine components
            values = base_monthly + trend + seasonality + noise
            
            # Ensure smooth transition for "today"
            if len(values) > historical_months:
                current_simulated = values[historical_months]
                correction = base_monthly - current_simulated
                values += correction
            
            # Determine trend direction
            first_val = values[historical_months] if len(values) > historical_months else values[0]
            last_val = values[-1]
            
            if last_val > first_val * AnalyticsConfig.PREDICTION_TREND_THRESHOLD_UP:
                trend_direction = 'increasing'
            elif last_val < first_val * AnalyticsConfig.PREDICTION_TREND_THRESHOLD_DOWN:
                trend_direction = 'decreasing'
            else:
                trend_direction = 'stable'
            
            # Create predictions list
            predictions = []
            today = datetime.now()
            start_date = today - timedelta(days=30 * historical_months)
            
            for i in range(total_months):
                point_date = start_date + timedelta(days=30 * i)
                p_cost = max(0, values[i])
                is_future = i >= historical_months
                
                predictions.append({
                    'month': point_date.strftime('%Y-%m'),
                    'date': point_date.strftime('%Y-%m-%d'),
                    'predicted_cost': round(float(p_cost), 2),
                    'is_prediction': is_future,
                    'confidence': 'high' if i < historical_months + 3 else 'medium'
                })
                
            return sanitize_for_json({
                'predictions': predictions,
                'trend': trend_direction,
                'current_monthly_cost': round(base_monthly, 2),
                'predicted_6_month_cost': round(float(predictions[-1]['predicted_cost']), 2),
                'total_predicted_cost': round(float(sum(p['predicted_cost'] for p in predictions if p['is_prediction'])), 2)
            })
            
        except Exception as e:
            logger.error(f"Error predicting future costs: {e}", exc_info=True)
            return {'predictions': [], 'trend': 'error'}
    
    def cluster_subscriptions(self, n_clusters: int = 3) -> Dict:
        """
        Cluster subscriptions using K-Means based on cost and billing cycle
        """
        try:
            if len(self.subscriptions) < n_clusters:
                return {'clusters': [], 'message': 'Not enough subscriptions for clustering'}
            
            active_subs = self._get_active_subscriptions()
            
            # Prepare data
            data = []
            cycle_map = {'monthly': 1, 'annual': 12}
            
            for sub in active_subs:
                cycle_value = cycle_map.get(sub.get_billing_cycle(), 1)
                data.append({
                    'name': sub.name,
                    'cost': sub.cost,
                    'cycle': cycle_value,
                    'annual_cost': sub.calculate_annual_cost()
                })
            
            if len(data) < n_clusters:
                return {'clusters': [], 'message': 'Not enough active subscriptions'}
            
            df = pd.DataFrame(data)
            X = df[['cost', 'cycle']].values
            
            # ML Pipeline
            X_scaled = self.scaler.fit_transform(X)
            kmeans = KMeans(
                n_clusters=n_clusters, 
                random_state=AnalyticsConfig.RANDOM_SEED, 
                n_init=AnalyticsConfig.CLUSTERING_N_INIT
            )
            df['cluster'] = kmeans.fit_predict(X_scaled)
            
            # Analyze clusters
            clusters = []
            for i in range(n_clusters):
                cluster_data = df[df['cluster'] == i]
                clusters.append({
                    'cluster_id': i,
                    'size': len(cluster_data),
                    'avg_cost': round(cluster_data['cost'].mean(), 2),
                    'total_monthly_cost': round(cluster_data['annual_cost'].sum() / 12, 2),
                    'subscriptions': cluster_data['name'].tolist(),
                    'label': self._get_cluster_label(cluster_data)
                })
            
            # Sort by average cost
            clusters.sort(key=lambda x: x['avg_cost'])
            
            return sanitize_for_json({
                'clusters': clusters,
                'total_clusters': n_clusters
            })
            
        except Exception as e:
            logger.error(f"Error clustering subscriptions: {e}", exc_info=True)
            return {'clusters': [], 'message': 'Error during clustering'}

    def _get_cluster_label(self, cluster_df: pd.DataFrame) -> str:
        """Generate descriptive label for cluster"""
        avg_cost = cluster_df['cost'].mean()
        if avg_cost < 10:
            return 'Budget Subscriptions'
        elif avg_cost < 30:
            return 'Standard Subscriptions'
        else:
            return 'Premium Subscriptions'
    
    def detect_unused_subscriptions(self) -> List[Dict]:
        """Detect potentially unused subscriptions based on heuristics"""
        try:
            unused = []
            active_subs = self._get_active_subscriptions()
            
            for sub in active_subs:
                days_active = (datetime.now() - sub.start_date).days
                
                # Heuristic check
                if (days_active > AnalyticsConfig.UNUSED_SUB_DAYS and 
                    sub.cost > AnalyticsConfig.UNUSED_SUB_COST_THRESHOLD):
                    
                    cost_per_day = sub.calculate_annual_cost() / 365
                    unused.append({
                        'name': sub.name,
                        'cost': sub.cost,
                        'billing_cycle': sub.get_billing_cycle(),
                        'days_active': days_active,
                        'cost_per_day': round(cost_per_day, 2),
                        'total_spent': round(cost_per_day * days_active, 2),
                        'reason': 'High cost, long duration - review usage'
                    })
            return sanitize_for_json(unused)
            
        except Exception as e:
            logger.error(f"Error detecting unused subscriptions: {e}", exc_info=True)
            return []
    
    def calculate_cost_efficiency(self) -> Dict:
        """Calculate cost efficiency metrics"""
        try:
            active_subs = self._get_active_subscriptions()
            if not active_subs:
                return {}
            
            total_annual = sum(sub.calculate_annual_cost() for sub in active_subs)
            total_monthly = total_annual / 12
            cost_per_sub = total_monthly / len(active_subs)
            
            # Category efficiency
            categories = {}
            for sub in active_subs:
                if sub.category not in categories:
                    categories[sub.category] = {'count': 0, 'cost': 0}
                categories[sub.category]['count'] += 1
                categories[sub.category]['cost'] += sub.calculate_annual_cost() / 12
            
            category_efficiency = {
                cat: data['cost'] / data['count'] for cat, data in categories.items()
            }
            
            if not category_efficiency:
                 return {}

            return sanitize_for_json({
                'total_monthly_cost': round(total_monthly, 2),
                'cost_per_subscription': round(cost_per_sub, 2),
                'total_subscriptions': len(active_subs),
                'category_efficiency': {k: round(v, 2) for k, v in category_efficiency.items()},
                'most_efficient_category': min(category_efficiency, key=category_efficiency.get),
                'least_efficient_category': max(category_efficiency, key=category_efficiency.get)
            })
            
        except Exception as e:
            logger.error(f"Error calculating cost efficiency: {e}", exc_info=True)
            return {}
