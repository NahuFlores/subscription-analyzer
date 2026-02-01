"""
Analytics Analyzer - Main data analysis engine using Pandas and NumPy
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from models import Subscription, User
from config import AnalyticsConfig


def sanitize_for_json(obj):
    """
    Replace NaN and Infinity with safe values for JSON serialization
    
    Args:
        obj: Object to sanitize (can be dict, list, float, etc.)
    
    Returns:
        Sanitized object safe for JSON serialization
    """
    if isinstance(obj, float):
        if np.isnan(obj) or np.isinf(obj):
            return 0.0
    elif isinstance(obj, dict):
        return {key: sanitize_for_json(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_for_json(item) for item in obj]
    return obj


class SubscriptionAnalyzer:
    """
    Main analytics engine for subscription data analysis.
    Uses Pandas for data manipulation and NumPy for numerical calculations.
    
    Attributes:
        subscriptions: List of Subscription objects to analyze
        user: User object for personalization
        dataframe: Pandas DataFrame containing subscription data
    """
    
    def __init__(self, subscriptions: List[Subscription], user: User):
        """
        Initialize analyzer with subscriptions and user data
        
        Args:
            subscriptions: List of Subscription objects
            user: User object
        
        Raises:
            ValueError: If subscriptions is None
        """
        if subscriptions is None:
            raise ValueError("Subscriptions list cannot be None")
        
        self.subscriptions = subscriptions
        self.user = user
        self.dataframe = self._create_dataframe()
    
    def _create_dataframe(self) -> pd.DataFrame:
        """
        Convert subscriptions list to Pandas DataFrame for analysis
        
        Returns:
            DataFrame with subscription data and calculated fields
        """
        if not self.subscriptions:
            return pd.DataFrame()
        
        data_rows = []
        for subscription in self.subscriptions:
            data_rows.append({
                'subscription_id': subscription.subscription_id,
                'name': subscription.name,
                'cost': subscription.cost,
                'billing_cycle': subscription.get_billing_cycle(),
                'category': subscription.category,
                'is_active': subscription.is_active,
                'start_date': subscription.start_date,
                'next_billing': subscription.calculate_next_billing(),
                'annual_cost': subscription.calculate_annual_cost()
            })
        
        dataframe = pd.DataFrame(data_rows)
        
        # Enforce data types for robust calculations
        if not dataframe.empty:
            dataframe['cost'] = dataframe['cost'].astype(float)
            dataframe['annual_cost'] = dataframe['annual_cost'].astype(float)
            dataframe['is_active'] = dataframe['is_active'].astype(bool)
            
        return dataframe
    
    def get_total_monthly_cost(self) -> float:
        """
        Calculate total monthly cost across all active subscriptions
        
        Returns:
            Total monthly cost (0.0 if no active subscriptions)
        """
        if self.dataframe.empty:
            return 0.0
        
        active_subscriptions = self.dataframe[self.dataframe['is_active'] == True]
        
        if active_subscriptions.empty:
            return 0.0

        total_annual_cost = active_subscriptions['annual_cost'].sum()
        return round(total_annual_cost / 12, 2)
    
    def get_total_annual_cost(self) -> float:
        """
        Calculate total annual cost across all active subscriptions
        
        Returns:
            Total annual cost
        """
        if self.dataframe.empty:
            return 0.0
        
        active_subscriptions = self.dataframe[self.dataframe['is_active'] == True]
        return round(active_subscriptions['annual_cost'].sum(), 2)
    
    def get_cost_by_category(self) -> Dict[str, float]:
        """
        Calculate monthly cost breakdown by category
        
        Returns:
            Dictionary mapping category name to monthly cost
        """
        if self.dataframe.empty:
            return {}
        
        active_subscriptions = self.dataframe[self.dataframe['is_active'] == True]
        
        category_annual_costs = active_subscriptions.groupby('category')['annual_cost'].sum()
        category_monthly_costs = (category_annual_costs / 12).round(2)
        
        return category_monthly_costs.to_dict()
    
    def get_cost_by_billing_cycle(self) -> Dict[str, float]:
        """
        Calculate monthly cost breakdown by billing cycle
        
        Returns:
            Dictionary mapping billing cycle to monthly cost
        """
        if self.dataframe.empty:
            return {}
        
        active_subscriptions = self.dataframe[self.dataframe['is_active'] == True]
        cycle_annual_costs = active_subscriptions.groupby('billing_cycle')['annual_cost'].sum()
        cycle_monthly_costs = (cycle_annual_costs / 12).round(2)
        
        return cycle_monthly_costs.to_dict()
    
    def get_upcoming_payments(self, days: int = None) -> List[Dict]:
        """
        Get subscriptions with payments due in the next N days
        
        Args:
            days: Number of days to look ahead (uses config default if None)
        
        Returns:
            List of upcoming payment dictionaries sorted by date
        """
        if days is None:
            days = AnalyticsConfig.DEFAULT_UPCOMING_DAYS
            
        if self.dataframe.empty:
            return []
        
        today = datetime.now()
        future_date = today + timedelta(days=days)
        
        active_subscriptions = self.dataframe[self.dataframe['is_active'] == True].copy()
        
        upcoming_subscriptions = active_subscriptions[
            (active_subscriptions['next_billing'] > today) & 
            (active_subscriptions['next_billing'] <= future_date)
        ]
        
        upcoming_subscriptions = upcoming_subscriptions.sort_values('next_billing')
        
        result = []
        for _, row in upcoming_subscriptions.iterrows():
            days_until_payment = (row['next_billing'] - today).days
            result.append({
                'name': row['name'],
                'cost': row['cost'],
                'billing_date': row['next_billing'].strftime('%Y-%m-%d'),
                'days_until': days_until_payment,
                'category': row['category']
            })
        
        return result
    
    def get_statistics(self) -> Dict:
        """
        Calculate comprehensive subscription statistics
        
        Returns:
            Dictionary containing various statistical metrics
        """
        if self.dataframe.empty:
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
        
        active_subscriptions = self.dataframe[self.dataframe['is_active'] == True]
        
        statistics = {
            'total_subscriptions': len(self.dataframe),
            'active_subscriptions': len(active_subscriptions),
            'inactive_subscriptions': len(self.dataframe) - len(active_subscriptions),
            'total_monthly_cost': self.get_total_monthly_cost(),
            'total_annual_cost': self.get_total_annual_cost(),
            'average_subscription_cost': round(active_subscriptions['cost'].mean(), 2) if not active_subscriptions.empty else 0.0,
            'median_subscription_cost': round(active_subscriptions['cost'].median(), 2) if not active_subscriptions.empty else 0.0,
            'std_subscription_cost': round(active_subscriptions['cost'].std(), 2) if not active_subscriptions.empty else 0.0
        }
        
        if not active_subscriptions.empty:
            category_costs = self.get_cost_by_category()
            if category_costs:
                most_expensive_category = max(category_costs, key=category_costs.get)
                statistics['most_expensive_category'] = {
                    'name': most_expensive_category,
                    'monthly_cost': category_costs[most_expensive_category]
                }
            
            cheapest_index = active_subscriptions['cost'].idxmin()
            expensive_index = active_subscriptions['cost'].idxmax()
            
            statistics['cheapest_subscription'] = {
                'name': active_subscriptions.loc[cheapest_index, 'name'],
                'cost': active_subscriptions.loc[cheapest_index, 'cost']
            }
            
            statistics['most_expensive_subscription'] = {
                'name': active_subscriptions.loc[expensive_index, 'name'],
                'cost': active_subscriptions.loc[expensive_index, 'cost']
            }
        
        return statistics
    
    def detect_cost_anomalies(self, threshold: float = None) -> List[Dict]:
        """
        Detect subscriptions with unusually high costs using statistical methods
        
        Args:
            threshold: Number of standard deviations from mean (uses config default if None)
        
        Returns:
            List of anomalous subscriptions with z-scores
        """
        if threshold is None:
            threshold = AnalyticsConfig.COST_ANOMALY_THRESHOLD
            
        if self.dataframe.empty or len(self.dataframe) < AnalyticsConfig.ML_MIN_DATA_POINTS:
            return []
        
        active_subscriptions = self.dataframe[self.dataframe['is_active'] == True]
        
        if active_subscriptions.empty or len(active_subscriptions) < AnalyticsConfig.ML_MIN_DATA_POINTS:
            return []
        
        costs = active_subscriptions['cost'].values
        mean_cost = np.mean(costs)
        std_cost = np.std(costs)
        
        upper_bound = mean_cost + (threshold * std_cost)
        anomalous_subscriptions = active_subscriptions[active_subscriptions['cost'] > upper_bound]
        
        result = []
        for _, row in anomalous_subscriptions.iterrows():
            z_score = (row['cost'] - mean_cost) / std_cost if std_cost > 0 else 0
            deviation_percentage = ((row['cost'] - mean_cost) / mean_cost) * 100
            
            result.append({
                'name': row['name'],
                'cost': row['cost'],
                'category': row['category'],
                'z_score': round(z_score, 2),
                'deviation_percentage': round(deviation_percentage, 1)
            })
        
        return result
    
    def get_category_distribution(self) -> Dict[str, int]:
        """
        Get count of active subscriptions per category
        
        Returns:
            Dictionary mapping category to subscription count
        """
        if self.dataframe.empty:
            return {}
        
        active_subscriptions = self.dataframe[self.dataframe['is_active'] == True]
        return active_subscriptions['category'].value_counts().to_dict()
    
    def _calculate_annual_billing_savings(self) -> List[Dict]:
        """
        Calculate potential savings from switching monthly to annual billing
        
        Returns:
            List of savings opportunities
        """
        opportunities = []
        monthly_subscriptions = self.dataframe[
            (self.dataframe['is_active'] == True) & 
            (self.dataframe['billing_cycle'] == 'monthly')
        ]
        
        for _, row in monthly_subscriptions.iterrows():
            current_annual_cost = row['cost'] * 12
            discounted_annual_cost = current_annual_cost * (1 - AnalyticsConfig.ANNUAL_DISCOUNT_RATE)
            monthly_savings = (current_annual_cost - discounted_annual_cost) / 12
            
            if monthly_savings >= AnalyticsConfig.MINIMUM_SAVINGS_SUGGESTION:
                opportunities.append({
                    'type': 'switch_to_annual',
                    'subscription': row['name'],
                    'current_monthly': row['cost'],
                    'potential_monthly_savings': round(monthly_savings, 2),
                    'annual_savings': round(monthly_savings * 12, 2)
                })
        
        return opportunities
    
    def _calculate_duplicate_category_savings(self) -> List[Dict]:
        """
        Identify duplicate categories with consolidation opportunities
        
        Returns:
            List of consolidation opportunities
        """
        opportunities = []
        active_subscriptions = self.dataframe[self.dataframe['is_active'] == True]
        category_counts = active_subscriptions['category'].value_counts()
        
        for category, count in category_counts.items():
            if count >= 2 and category != 'Other':
                category_subscriptions = active_subscriptions[active_subscriptions['category'] == category]
                total_category_cost = category_subscriptions['cost'].sum()
                estimated_savings = total_category_cost * AnalyticsConfig.DUPLICATE_CATEGORY_SAVINGS_RATE
                
                opportunities.append({
                    'type': 'duplicate_category',
                    'category': category,
                    'count': count,
                    'total_monthly_cost': round(total_category_cost, 2),
                    'suggestion': f"You have {count} {category} subscriptions. Consolidating could save ~${round(estimated_savings, 2)}.",
                    'potential_monthly_savings': round(estimated_savings, 2)
                })
        
        return opportunities
    
    def _calculate_high_cost_savings(self) -> List[Dict]:
        """
        Identify high-cost subscriptions with potential tier downgrades
        
        Returns:
            List of high-cost optimization opportunities
        """
        opportunities = []
        active_subscriptions = self.dataframe[self.dataframe['is_active'] == True]
        
        for _, row in active_subscriptions.iterrows():
            if row['cost'] > AnalyticsConfig.HIGH_COST_THRESHOLD:
                potential_savings = row['cost'] * AnalyticsConfig.HIGH_COST_SAVINGS_RATE
                
                opportunities.append({
                    'type': 'high_cost',
                    'subscription': row['name'],
                    'current_monthly': row['cost'],
                    'suggestion': f"{row['name']} is expensive (${row['cost']}). Check for lower tier plans.",
                    'potential_monthly_savings': round(potential_savings, 2)
                })
        
        return opportunities
    
    def calculate_potential_savings(self) -> Dict:
        """
        Calculate all potential savings opportunities
        
        Returns:
            Dictionary with total savings and list of opportunities
        """
        if self.dataframe.empty:
            return {'total_potential_savings': 0.0, 'opportunities': []}
        
        all_opportunities = []
        
        # Collect all types of savings opportunities
        all_opportunities.extend(self._calculate_annual_billing_savings())
        all_opportunities.extend(self._calculate_duplicate_category_savings())
        all_opportunities.extend(self._calculate_high_cost_savings())
        
        # Calculate total savings
        total_monthly_savings = sum(
            opportunity['potential_monthly_savings'] 
            for opportunity in all_opportunities
        )
        
        return {
            'total_potential_monthly_savings': round(total_monthly_savings, 2),
            'total_potential_annual_savings': round(total_monthly_savings * 12, 2),
            'opportunities': all_opportunities
        }
    
    def export_to_dict(self) -> Dict:
        """
        Export all analytics data as a dictionary
        
        Returns:
            Dictionary containing all analytics results
        """
        data = {
            'statistics': self.get_statistics(),
            'cost_by_category': self.get_cost_by_category(),
            'cost_by_billing_cycle': self.get_cost_by_billing_cycle(),
            'upcoming_payments': self.get_upcoming_payments(AnalyticsConfig.EXTENDED_UPCOMING_DAYS),
            'cost_anomalies': self.detect_cost_anomalies(),
            'category_distribution': self.get_category_distribution(),
            'potential_savings': self.calculate_potential_savings()
        }
        
        return sanitize_for_json(data)
