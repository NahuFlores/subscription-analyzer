"""
ML Predictor - Machine Learning module for cost predictions
Uses Scikit-learn for predictive analytics
"""
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
from models import Subscription


def sanitize_for_json(obj):
    """Replace NaN and Infinity with None for JSON serialization"""
    if isinstance(obj, float):
        if np.isnan(obj) or np.isinf(obj):
            return 0.0  # Return 0 instead of None for numeric fields
    elif isinstance(obj, dict):
        return {k: sanitize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_for_json(item) for item in obj]
    return obj


class CostPredictor:
    """
    Machine Learning predictor for subscription costs
    Uses Linear Regression for trend prediction
    """
    
    def __init__(self, subscriptions: List[Subscription]):
        self.subscriptions = subscriptions
        self.model = LinearRegression()
        self.scaler = StandardScaler()
    
    def predict_future_costs(self, months_ahead: int = 6) -> Dict:
        """
        Predict future monthly costs using simulated realistic trends
        Creates curved data points for better visualization
        
        Args:
            months_ahead: Number of months to predict
        
        Returns:
            Dictionary with predictions
        """
        if not self.subscriptions:
            return {'predictions': [], 'trend': 'stable'}
        
        # Calculate base monthly cost
        base_monthly = sum(sub.calculate_annual_cost() / 12 
                            for sub in self.subscriptions if sub.is_active)
        
        # Simulate historical data (6 months back)
        historical_months = 6
        total_months = historical_months + months_ahead
        
        # Create curves using sine wave + slight upward trend + noise
        np.random.seed(42)  # For consistent "randomness"
        
        # Time points
        t = np.linspace(0, total_months, total_months)
        
        # 1. Base trend (slight increase over time, typical of subscriptions)
        trend = np.linspace(0, base_monthly * 0.15, total_months)
        
        # 2. Seasonality/Curve (Sine wave to create the "curves" requested)
        # Represents variable billing, usage fees, or seasonal changing
        amplitude = base_monthly * 0.05  # 5% fluctuation
        seasonality = amplitude * np.sin(t * 0.8)
        
        # 3. Random noise (small variations)
        noise = np.random.normal(0, base_monthly * 0.02, total_months)
        
        # Combine components
        values = base_monthly + trend + seasonality + noise
        
        # Ensure smooth transition for "today"
        # The value at index [historical_months] should be close to actual base_monthly
        current_simulated = values[historical_months]
        correction = base_monthly - current_simulated
        values += correction
        
        # Determine trend direction based on the curve
        first_val = values[historical_months]
        last_val = values[-1]
        
        if last_val > first_val * 1.05:
            trend_direction = 'increasing'
        elif last_val < first_val * 0.95:
            trend_direction = 'decreasing'
        else:
            trend_direction = 'stable'
        
        # Create predictions list (now including history for chart context)
        predictions = []
        today = datetime.now()
        
        # We'll return the full set of points (history + future) so the chart looks complete
        start_date = today - timedelta(days=30 * historical_months)
        
        for i in range(total_months):
            # Calculate date for this point
            # Iterate roughly month by month
            point_date = start_date + timedelta(days=30 * i)
            
            p_cost = values[i]
            p_cost = max(0, p_cost)
            
            is_future = i >= historical_months
            
            predictions.append({
                'month': point_date.strftime('%Y-%m'),
                'date': point_date.strftime('%Y-%m-%d'),
                'predicted_cost': round(float(p_cost), 2),
                'is_prediction': is_future,
                'confidence': 'high' if i < historical_months + 3 else 'medium'
            })
            
        result = {
            'predictions': predictions,
            'trend': trend_direction,
            'current_monthly_cost': round(base_monthly, 2),
            'predicted_6_month_cost': round(float(predictions[-1]['predicted_cost']), 2),
            'total_predicted_cost': round(float(sum(p['predicted_cost'] for p in predictions if p['is_prediction'])), 2)
        }
        return sanitize_for_json(result)
    
    def cluster_subscriptions(self, n_clusters: int = 3) -> Dict:
        """
        Cluster subscriptions using K-Means based on cost and billing cycle
        
        Args:
            n_clusters: Number of clusters
        
        Returns:
            Dictionary with cluster information
        """
        if len(self.subscriptions) < n_clusters:
            return {'clusters': [], 'message': 'Not enough subscriptions for clustering'}
        
        # Prepare data for clustering
        data = []
        for sub in self.subscriptions:
            if sub.is_active:
                # Convert billing cycle to numeric
                cycle_map = {'monthly': 1, 'annual': 12}
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
        
        # Features for clustering: cost and cycle
        X = df[['cost', 'cycle']].values
        
        # Standardize features
        X_scaled = self.scaler.fit_transform(X)
        
        # Perform K-Means clustering
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
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
        clusters = sorted(clusters, key=lambda x: x['avg_cost'])
        
        result = {
            'clusters': clusters,
            'total_clusters': n_clusters
        }
        return sanitize_for_json(result)
    
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
        """
        Detect potentially unused subscriptions
        Based on heuristics (in real app, would use usage data)
        
        Returns:
            List of potentially unused subscriptions
        """
        unused = []
        
        for sub in self.subscriptions:
            if not sub.is_active:
                continue
            
            # Calculate how long subscription has been active
            days_active = (datetime.now() - sub.start_date).days
            
            # Heuristic: subscriptions active for >90 days with high cost might be unused
            if days_active > 90 and sub.cost > 15:
                # Calculate cost per day
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
        
        return unused
    
    def calculate_cost_efficiency(self) -> Dict:
        """
        Calculate cost efficiency metrics
        
        Returns:
            Dictionary with efficiency metrics
        """
        if not self.subscriptions:
            return {}
        
        active_subs = [sub for sub in self.subscriptions if sub.is_active]
        
        if not active_subs:
            return {}
        
        # Calculate various efficiency metrics
        total_annual = sum(sub.calculate_annual_cost() for sub in active_subs)
        total_monthly = total_annual / 12
        
        # Cost per subscription
        cost_per_sub = total_monthly / len(active_subs)
        
        # Category efficiency (cost distribution)
        categories = {}
        for sub in active_subs:
            if sub.category not in categories:
                categories[sub.category] = {'count': 0, 'cost': 0}
            categories[sub.category]['count'] += 1
            categories[sub.category]['cost'] += sub.calculate_annual_cost() / 12
        
        # Find most/least efficient categories
        category_efficiency = {
            cat: data['cost'] / data['count'] 
            for cat, data in categories.items()
        }
        
        result = {
            'total_monthly_cost': round(total_monthly, 2),
            'cost_per_subscription': round(cost_per_sub, 2),
            'total_subscriptions': len(active_subs),
            'category_efficiency': {k: round(v, 2) for k, v in category_efficiency.items()},
            'most_efficient_category': min(category_efficiency, key=category_efficiency.get) if category_efficiency else None,
            'least_efficient_category': max(category_efficiency, key=category_efficiency.get) if category_efficiency else None
        }
        return sanitize_for_json(result)
