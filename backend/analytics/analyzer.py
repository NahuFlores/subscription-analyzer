"""
Analytics Analyzer - Main data analysis engine using Pandas and NumPy
"""
import logging
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from models import Subscription, User
from config import AnalyticsConfig

logger = logging.getLogger(__name__)

def sanitize_for_json(obj: Any) -> Any:
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
        Initialize analyzer with robust validation
        
        Args:
            subscriptions: List of Subscription objects
            user: User object
        
        Raises:
            TypeError: If arguments have wrong types
            ValueError: If arguments are invalid
        """
        self._validate_inputs(subscriptions, user)
        
        self.subscriptions = subscriptions
        self.user = user
        self.dataframe = self._create_dataframe()

    def _validate_inputs(self, subscriptions: List[Subscription], user: User) -> None:
        """Validate constructor inputs"""
        if not isinstance(subscriptions, list):
            raise TypeError(f"subscriptions must be a list, got {type(subscriptions)}")
        
        if user is None:
            raise ValueError("User cannot be None")

        if not isinstance(user, User):
            raise TypeError(f"user must be User instance, got {type(user)}")
            
        for idx, sub in enumerate(subscriptions):
            if not isinstance(sub, Subscription):
                raise TypeError(f"subscriptions[{idx}] must be Subscription, got {type(sub)}")

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

    def _get_active_subscriptions(self) -> pd.DataFrame:
        """
        Get filtered DataFrame with only active subscriptions
        
        Returns:
            DataFrame containing only active subscriptions
        """
        if self.dataframe.empty:
            return pd.DataFrame()
        
        return self.dataframe[self.dataframe['is_active']].copy()

    def get_total_monthly_cost(self) -> float:
        """
        Calculate total monthly cost across all active subscriptions
        
        Returns:
            Total monthly cost (0.0 if no active subscriptions)
        """
        try:
            active_df = self._get_active_subscriptions()
            
            if active_df.empty:
                return 0.0

            # Handle potentially corrupted data
            annual_costs = active_df['annual_cost'].fillna(0.0)
            if (annual_costs < 0).any():
                logger.warning(f"Negative costs detected for user {self.user.user_id}, clipping to 0")
                annual_costs = annual_costs.clip(lower=0.0)

            total_annual_cost = annual_costs.sum()
            
            if np.isnan(total_annual_cost) or np.isinf(total_annual_cost):
                logger.error(f"Invalid total annual cost for user {self.user.user_id}")
                return 0.0
                
            return round(total_annual_cost / 12, 2)
            
        except Exception as e:
            logger.error(f"Error calculating monthly cost: {e}", exc_info=True)
            return 0.0
    
    def get_total_annual_cost(self) -> float:
        """
        Calculate total annual cost across all active subscriptions
        
        Returns:
            Total annual cost
        """
        try:
            active_df = self._get_active_subscriptions()
            if active_df.empty:
                return 0.0
            
            annual_costs = active_df['annual_cost'].fillna(0.0)
            return round(annual_costs.sum(), 2)
        except Exception as e:
            logger.error(f"Error calculating annual cost: {e}", exc_info=True)
            return 0.0
    
    def get_cost_by_category(self) -> Dict[str, float]:
        """
        Calculate monthly cost breakdown by category
        
        Returns:
            Dictionary mapping category name to monthly cost
        """
        try:
            active_df = self._get_active_subscriptions()
            if active_df.empty:
                return {}
            
            category_annual_costs = active_df.groupby('category')['annual_cost'].sum()
            category_monthly_costs = (category_annual_costs / 12).round(2)
            
            return category_monthly_costs.to_dict()
        except Exception as e:
            logger.error(f"Error calculating cost by category: {e}", exc_info=True)
            return {}
    
    def get_cost_by_billing_cycle(self) -> Dict[str, float]:
        """
        Calculate monthly cost breakdown by billing cycle
        
        Returns:
            Dictionary mapping billing cycle to monthly cost
        """
        try:
            active_df = self._get_active_subscriptions()
            if active_df.empty:
                return {}
            
            cycle_annual_costs = active_df.groupby('billing_cycle')['annual_cost'].sum()
            cycle_monthly_costs = (cycle_annual_costs / 12).round(2)
            
            return cycle_monthly_costs.to_dict()
        except Exception as e:
            logger.error(f"Error calculating cost by billing cycle: {e}", exc_info=True)
            return {}
    
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
            
        active_df = self._get_active_subscriptions()
        if active_df.empty:
            return []
        
        today = datetime.now()
        future_date = today + timedelta(days=days)
        
        # Ensure next_billing is datetime
        try:
            upcoming_subscriptions = active_df[
                (active_df['next_billing'] > today) & 
                (active_df['next_billing'] <= future_date)
            ].copy()
            
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
        except Exception as e:
            logger.error(f"Error getting upcoming payments: {e}", exc_info=True)
            return []

    def get_statistics(self) -> Dict:
        """
        Calculate comprehensive subscription statistics
        
        Returns:
            Dictionary containing various statistical metrics
        """
        try:
            if self.dataframe.empty:
                return self._get_empty_statistics()
            
            active_df = self._get_active_subscriptions()
            
            statistics = {
                'total_subscriptions': len(self.dataframe),
                'active_subscriptions': len(active_df),
                'inactive_subscriptions': len(self.dataframe) - len(active_df),
                'total_monthly_cost': self.get_total_monthly_cost(),
                'total_annual_cost': self.get_total_annual_cost(),
                'average_subscription_cost': round(active_df['cost'].mean(), 2) if not active_df.empty else 0.0,
                'median_subscription_cost': round(active_df['cost'].median(), 2) if not active_df.empty else 0.0,
                'std_subscription_cost': round(active_df['cost'].std(), 2) if not active_df.empty else 0.0
            }
            
            if not active_df.empty:
                category_costs = self.get_cost_by_category()
                if category_costs:
                    most_expensive_category = max(category_costs, key=category_costs.get)
                    statistics['most_expensive_category'] = {
                        'name': most_expensive_category,
                        'monthly_cost': category_costs[most_expensive_category]
                    }
                
                cheapest_index = active_df['cost'].idxmin()
                expensive_index = active_df['cost'].idxmax()
                
                statistics['cheapest_subscription'] = {
                    'name': active_df.loc[cheapest_index, 'name'],
                    'cost': active_df.loc[cheapest_index, 'cost']
                }
                
                statistics['most_expensive_subscription'] = {
                    'name': active_df.loc[expensive_index, 'name'],
                    'cost': active_df.loc[expensive_index, 'cost']
                }
            else:
                 # Fill explicitly if empty active subs but rows exist
                 statistics.update({
                    'most_expensive_category': None,
                    'cheapest_subscription': None,
                    'most_expensive_subscription': None
                 })
            
            return statistics
        except Exception as e:
             logger.error(f"Error getting statistics: {e}", exc_info=True)
             return self._get_empty_statistics()

    def _get_empty_statistics(self) -> Dict:
        """Return default statistics for empty/error state"""
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
        
        try:
            active_df = self._get_active_subscriptions()
            
            if active_df.empty or len(active_df) < AnalyticsConfig.ML_MIN_DATA_POINTS:
                return []
            
            costs = active_df['cost'].values
            mean_cost = np.mean(costs)
            std_cost = np.std(costs)
            
            if std_cost == 0:
                return []

            upper_bound = mean_cost + (threshold * std_cost)
            anomalous_subscriptions = active_df[active_df['cost'] > upper_bound]
            
            result = []
            for _, row in anomalous_subscriptions.iterrows():
                cost_deviation = row['cost'] - mean_cost
                z_score = cost_deviation / std_cost
                deviation_percentage = (cost_deviation / mean_cost) * 100
                
                result.append({
                    'name': row['name'],
                    'cost': row['cost'],
                    'category': row['category'],
                    'z_score': round(z_score, 2),
                    'deviation_percentage': round(deviation_percentage, 1)
                })
            
            return result
        except Exception as e:
            logger.error(f"Error detecting cost anomalies: {e}", exc_info=True)
            return []

    def get_category_distribution(self) -> Dict[str, int]:
        """
        Get count of active subscriptions per category
        
        Returns:
            Dictionary mapping category to subscription count
        """
        active_df = self._get_active_subscriptions()
        if active_df.empty:
            return {}
        
        return active_df['category'].value_counts().to_dict()
    
    def _calculate_annual_billing_savings(self) -> List[Dict]:
        """
        Calculate potential savings from switching monthly to annual billing
        
        Returns:
            List of savings opportunities
        """
        opportunities = []
        active_df = self._get_active_subscriptions()
        if active_df.empty:
            return []

        monthly_subscriptions = active_df[active_df['billing_cycle'] == 'monthly']
        
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
        active_df = self._get_active_subscriptions()
        if active_df.empty:
            return []

        category_counts = active_df['category'].value_counts()
        
        for category, count in category_counts.items():
            if count >= 2 and category != 'Other':
                category_subscriptions = active_df[active_df['category'] == category]
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
        active_df = self._get_active_subscriptions()
        if active_df.empty:
            return []
        
        for _, row in active_df.iterrows():
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
        
        try:
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
        except Exception as e:
             logger.error(f"Error calculating potential savings: {e}", exc_info=True)
             return {'total_potential_savings': 0.0, 'opportunities': []}
    
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
