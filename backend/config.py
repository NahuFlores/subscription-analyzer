"""
Configuration module for Flask app and Firebase
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Config:
    """Application configuration"""
    
    # Flask configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV != 'production'
    
    # Server configuration
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    
    # Firebase configuration
    FIREBASE_CREDENTIALS_PATH = os.getenv('FIREBASE_CREDENTIALS_PATH', '')
    
    # CORS configuration - dynamically set based on environment
    @staticmethod
    def get_cors_origins():
        """Get CORS origins based on environment"""
        if Config.FLASK_ENV == 'production':
            # In production, allow your Render domain
            render_url = os.getenv('RENDER_EXTERNAL_URL', '')
            if render_url:
                return [render_url]
            return ['*']  # Fallback, but should set RENDER_EXTERNAL_URL
        else:
            # Development origins
            return [
                'http://localhost:5000',
                'http://127.0.0.1:5000',
                'http://localhost:5173',
                'http://127.0.0.1:5173'
            ]
    
    CORS_ORIGINS = get_cors_origins.__func__()


class AnalyticsConfig:
    """Analytics and ML configuration constants"""
    
    # Cost anomaly detection
    COST_ANOMALY_THRESHOLD = 2.0  # Standard deviations from mean
    
    # Savings calculations
    ANNUAL_DISCOUNT_RATE = 0.17  # 17% discount for annual billing (2 months free)
    DUPLICATE_CATEGORY_SAVINGS_RATE = 0.40  # 40% potential savings from consolidation
    HIGH_COST_THRESHOLD = 40.0  # Dollar amount to flag as "high cost"
    HIGH_COST_SAVINGS_RATE = 0.20  # 20% potential savings from tier downgrade
    MINIMUM_SAVINGS_SUGGESTION = 1.0  # Minimum monthly savings to suggest ($)
    
    # Upcoming payments
    DEFAULT_UPCOMING_DAYS = 7  # Days to look ahead for payments
    EXTENDED_UPCOMING_DAYS = 30  # Extended range for analytics export
    
    # Machine Learning
    ML_PREDICTION_MONTHS = 6  # Default months for cost predictions
    ML_MIN_DATA_POINTS = 3  # Minimum subscriptions needed for ML
