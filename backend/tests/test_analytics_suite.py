import pytest
import os
import shutil
from datetime import datetime
from models import MonthlySubscription, User
from analytics.predictor import CostPredictor
from analytics.report_generator import ReportGenerator

class TestAnalyticsSuite:
    
    @pytest.fixture
    def sample_data(self):
        user = User(user_id="test_user", email="test@example.com", name="Test")
        subs = [
            MonthlySubscription(user_id="test_user", name="App A", cost=10.0, start_date=datetime.now()),
            MonthlySubscription(user_id="test_user", name="App B", cost=20.0, start_date=datetime.now()),
            MonthlySubscription(user_id="test_user", name="App C", cost=5.0, start_date=datetime.now(), is_active=False)
        ]
        return subs

    def test_predictor_initialization(self, sample_data):
        """Test predictor initialization and validation"""
        predictor = CostPredictor(sample_data)
        assert len(predictor.subscriptions) == 3
        # Should gracefully handle empty lists
        with pytest.raises(ValueError):
            CostPredictor(None)

    def test_predictor_active_helper(self, sample_data):
        """Verify _get_active_subscriptions helper works"""
        predictor = CostPredictor(sample_data)
        active = predictor._get_active_subscriptions()
        assert len(active) == 2  # App A and B
        assert all(s.is_active for s in active)

    def test_predictor_prediction_logic(self, sample_data):
        """Verify prediction logic runs without magic number errors"""
        predictor = CostPredictor(sample_data)
        result = predictor.predict_future_costs(months_ahead=3)
        assert 'predictions' in result
        assert result['trend'] in ['increasing', 'decreasing', 'stable']

    def test_report_generator_lazy_loading(self, sample_data):
        """Test that plotting libs are lazy loaded correctly"""
        generator = ReportGenerator(sample_data)
        # Initially None
        assert generator._plt is None
        
        # Trigger load
        # We mock plotting to allow running in envs without GUI/libs (optional, but good practice)
        # Here we just check it doesn't crash if libs are present
        try:
            generator._ensure_plotting_libs()
            assert generator._plt is not None
        except ImportError:
            pytest.skip("Matplotlib not installed")

    def test_report_generator_error_handling(self, sample_data):
        """Test that generator survives errors"""
        generator = ReportGenerator([]) # Empty
        # Should return empty string, not crash
        assert generator.create_category_distribution_plot() == ""

if __name__ == "__main__":
    print("Running tests via pytest...")
    os.system("pytest tests/test_analytics_suite.py")
