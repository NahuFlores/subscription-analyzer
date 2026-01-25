"""
Analytics Analyzer - Main data analysis engine using Pandas and NumPy
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
from models import Subscription, User


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


class SubscriptionAnalyzer:
    """
    Main analytics engine for subscription data analysis
    Uses Pandas for data manipulation and NumPy for calculations
    """
    
    def __init__(self, subscriptions: List[Subscription], user: User):
        self.subscriptions = subscriptions
        self.user = user
        self.df = self._create_dataframe()
    
    def _create_dataframe(self) -> pd.DataFrame:
        """Convert subscriptions list to Pandas DataFrame for analysis"""
        if not self.subscriptions:
            return pd.DataFrame()
        
        data = []
        for sub in self.subscriptions:
            data.append({
                'subscription_id': sub.subscription_id,
                'name': sub.name,
                'cost': sub.cost,
                'billing_cycle': sub.get_billing_cycle(),
                'category': sub.category,
                'is_active': sub.is_active,
                'start_date': sub.start_date,
                'next_billing': sub.calculate_next_billing(),
                'annual_cost': sub.calculate_annual_cost()
            })
        
        df = pd.DataFrame(data)
        return df
    
    def get_total_monthly_cost(self) -> float:
        """Calculate total monthly cost across all active subscriptions"""
        if self.df.empty:
            return 0.0
        
        active_df = self.df[self.df['is_active'] == True]
        total_annual = active_df['annual_cost'].sum()
        return round(total_annual / 12, 2)
    
    def get_total_annual_cost(self) -> float:
        """Calculate total annual cost"""
        if self.df.empty:
            return 0.0
        
        active_df = self.df[self.df['is_active'] == True]
        return round(active_df['annual_cost'].sum(), 2)
    
    def get_cost_by_category(self) -> Dict[str, float]:
        """
        Calculate monthly cost breakdown by category
        Returns: Dictionary of category -> monthly cost
        """
        if self.df.empty:
            return {}
        
        active_df = self.df[self.df['is_active'] == True]
        
        # Group by category and sum annual costs
        category_costs = active_df.groupby('category')['annual_cost'].sum()
        
        # Convert to monthly and return as dict
        monthly_costs = (category_costs / 12).round(2)
        return monthly_costs.to_dict()
    
    def get_cost_by_billing_cycle(self) -> Dict[str, float]:
        """Calculate cost breakdown by billing cycle"""
        if self.df.empty:
            return {}
        
        active_df = self.df[self.df['is_active'] == True]
        cycle_costs = active_df.groupby('billing_cycle')['annual_cost'].sum()
        monthly_costs = (cycle_costs / 12).round(2)
        return monthly_costs.to_dict()
    
    def get_upcoming_payments(self, days: int = 7) -> List[Dict]:
        """
        Get subscriptions with payments due in the next N days
        
        Args:
            days: Number of days to look ahead
        
        Returns:
            List of upcoming payment dictionaries
        """
        if self.df.empty:
            return []
        
        today = datetime.now()
        future_date = today + timedelta(days=days)
        
        active_df = self.df[self.df['is_active'] == True].copy()
        
        # Filter subscriptions with next_billing in the date range
        upcoming = active_df[
            (active_df['next_billing'] > today) & 
            (active_df['next_billing'] <= future_date)
        ]
        
        # Sort by next_billing date
        upcoming = upcoming.sort_values('next_billing')
        
        result = []
        for _, row in upcoming.iterrows():
            days_until = (row['next_billing'] - today).days
            result.append({
                'name': row['name'],
                'cost': row['cost'],
                'billing_date': row['next_billing'].strftime('%Y-%m-%d'),
                'days_until': days_until,
                'category': row['category']
            })
        
        return result
    
    def get_statistics(self) -> Dict:
        """
        Calculate comprehensive statistics
        
        Returns:
            Dictionary with various statistical metrics
        """
        if self.df.empty:
            return {
                'total_subscriptions': 0,
                'active_subscriptions': 0,
                'inactive_subscriptions': 0,
                'total_monthly_cost': 0.0,
                'total_annual_cost': 0.0,
                'average_subscription_cost': 0.0,
                'most_expensive_category': None,
                'cheapest_subscription': None,
                'most_expensive_subscription': None
            }
        
        active_df = self.df[self.df['is_active'] == True]
        
        # Calculate statistics
        stats = {
            'total_subscriptions': len(self.df),
            'active_subscriptions': len(active_df),
            'inactive_subscriptions': len(self.df) - len(active_df),
            'total_monthly_cost': self.get_total_monthly_cost(),
            'total_annual_cost': self.get_total_annual_cost(),
            'average_subscription_cost': round(active_df['cost'].mean(), 2) if not active_df.empty else 0.0,
            'median_subscription_cost': round(active_df['cost'].median(), 2) if not active_df.empty else 0.0,
            'std_subscription_cost': round(active_df['cost'].std(), 2) if not active_df.empty else 0.0
        }
        
        # Most expensive category
        if not active_df.empty:
            category_costs = self.get_cost_by_category()
            if category_costs:
                most_expensive_cat = max(category_costs, key=category_costs.get)
                stats['most_expensive_category'] = {
                    'name': most_expensive_cat,
                    'monthly_cost': category_costs[most_expensive_cat]
                }
            
            # Cheapest and most expensive subscriptions
            cheapest_idx = active_df['cost'].idxmin()
            expensive_idx = active_df['cost'].idxmax()
            
            stats['cheapest_subscription'] = {
                'name': active_df.loc[cheapest_idx, 'name'],
                'cost': active_df.loc[cheapest_idx, 'cost']
            }
            
            stats['most_expensive_subscription'] = {
                'name': active_df.loc[expensive_idx, 'name'],
                'cost': active_df.loc[expensive_idx, 'cost']
            }
        
        return stats
    
    def detect_cost_anomalies(self, threshold: float = 2.0) -> List[Dict]:
        """
        Detect subscriptions with unusually high costs using statistical methods
        
        Args:
            threshold: Number of standard deviations from mean to consider anomaly
        
        Returns:
            List of anomalous subscriptions
        """
        if self.df.empty or len(self.df) < 3:
            return []
        
        active_df = self.df[self.df['is_active'] == True]
        
        if active_df.empty or len(active_df) < 3:
            return []
        
        # Calculate mean and std using NumPy
        costs = active_df['cost'].values
        mean_cost = np.mean(costs)
        std_cost = np.std(costs)
        
        # Find anomalies (costs > mean + threshold*std)
        upper_bound = mean_cost + (threshold * std_cost)
        
        anomalies = active_df[active_df['cost'] > upper_bound]
        
        result = []
        for _, row in anomalies.iterrows():
            z_score = (row['cost'] - mean_cost) / std_cost if std_cost > 0 else 0
            result.append({
                'name': row['name'],
                'cost': row['cost'],
                'category': row['category'],
                'z_score': round(z_score, 2),
                'deviation_percentage': round(((row['cost'] - mean_cost) / mean_cost) * 100, 1)
            })
        
        return result
    
    def get_category_distribution(self) -> Dict[str, int]:
        """Get count of subscriptions per category"""
        if self.df.empty:
            return {}
        
        active_df = self.df[self.df['is_active'] == True]
        return active_df['category'].value_counts().to_dict()
    
    def calculate_potential_savings(self) -> Dict:
        """
        Calculate potential savings by identifying optimization opportunities
        
        Returns:
            Dictionary with savings opportunities
        """
        if self.df.empty:
            return {'total_potential_savings': 0.0, 'opportunities': []}
        
        active_df = self.df[self.df['is_active'] == True]
        opportunities = []
        total_savings = 0.0
        
        # Opportunity 1: Switch monthly to annual (typically 10-20% savings)
        monthly_subs = active_df[active_df['billing_cycle'] == 'monthly']
        for _, row in monthly_subs.iterrows():
            annual_cost = row['cost'] * 12
            potential_annual_price = annual_cost * 0.85  # Assume 15% discount
            monthly_savings = (annual_cost - potential_annual_price) / 12
            
            if monthly_savings > 2:  # Only suggest if savings > $2/month
                opportunities.append({
                    'type': 'switch_to_annual',
                    'subscription': row['name'],
                    'current_monthly': row['cost'],
                    'potential_monthly_savings': round(monthly_savings, 2),
                    'annual_savings': round(monthly_savings * 12, 2)
                })
                total_savings += monthly_savings
        
        # Opportunity 2: Identify duplicate categories
        category_counts = active_df['category'].value_counts()
        for category, count in category_counts.items():
            if count > 2 and category != 'Other':
                category_subs = active_df[active_df['category'] == category]
                category_cost = category_subs['cost'].sum()
                
                opportunities.append({
                    'type': 'duplicate_category',
                    'category': category,
                    'count': count,
                    'total_monthly_cost': round(category_cost, 2),
                    'suggestion': f"You have {count} {category} subscriptions. Consider consolidating."
                })
        
        return {
            'total_potential_monthly_savings': round(total_savings, 2),
            'total_potential_annual_savings': round(total_savings * 12, 2),
            'opportunities': opportunities
        }
    
    def export_to_dict(self) -> Dict:
        """Export all analytics data as dictionary"""
        data = {
            'statistics': self.get_statistics(),
            'cost_by_category': self.get_cost_by_category(),
            'cost_by_billing_cycle': self.get_cost_by_billing_cycle(),
            'upcoming_payments': self.get_upcoming_payments(7),
            'cost_anomalies': self.detect_cost_anomalies(),
            'category_distribution': self.get_category_distribution(),
            'potential_savings': self.calculate_potential_savings()
        }
        return sanitize_for_json(data)
