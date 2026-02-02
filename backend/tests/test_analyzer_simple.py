import pytest
import pandas as pd
import numpy as np
from datetime import datetime
from models import MonthlySubscription, User
from analytics.analyzer import SubscriptionAnalyzer

class TestAnalyzerRefactored:
    def test_analyzer_initialization(self):
        """Test proper initialization with validation"""
        user = User(user_id="test_user", email="test@example.com", name="Test")
        subs = [
            MonthlySubscription(user_id="test_user", name="Netflix", cost=10.0, start_date=datetime.now())
        ]
        analyzer = SubscriptionAnalyzer(subs, user)
        assert isinstance(analyzer.dataframe, pd.DataFrame)
        assert not analyzer.dataframe.empty

    def test_analyzer_dry_helper(self):
        """Test _get_active_subscriptions helper"""
        user = User(user_id="test_user", email="test@example.com", name="Test")
        subs = [
            MonthlySubscription(user_id="test_user", name="Active", cost=10.0, start_date=datetime.now(), is_active=True),
            MonthlySubscription(user_id="test_user", name="Inactive", cost=10.0, start_date=datetime.now(), is_active=False)
        ]
        analyzer = SubscriptionAnalyzer(subs, user)
        active_df = analyzer._get_active_subscriptions()
        
        assert len(active_df) == 1
        assert active_df.iloc[0]['name'] == 'Active'

    def test_robust_math_handling(self):
        """Test handling of NaN/Empty scenarios"""
        user = User(user_id="test_user", email="test@example.com", name="Test")
        analyzer = SubscriptionAnalyzer([], user)
        
        # All these should return safe 0.0 or defaults, not crash
        assert analyzer.get_total_monthly_cost() == 0.0
        assert analyzer.get_total_annual_cost() == 0.0
        assert analyzer.get_cost_by_category() == {}
        assert analyzer.detect_cost_anomalies() == []

if __name__ == "__main__":
    # verification via script execution if pytest not avail
    print("Running manual verification...")
    t = TestAnalyzerRefactored()
    t.test_analyzer_initialization()
    t.test_analyzer_dry_helper()
    t.test_robust_math_handling()
    print("Verification passed!")
