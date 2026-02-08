"""
Flask Application - Main entry point
Subscription Analyzer Backend
"""
from flask import Flask
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import Config
from utils import FirebaseHelper
from utils.logger import setup_logging
from extensions import limiter, talisman, cors
from routes import subscription_bp, analytics_bp, main_bp


def create_app(config_class=Config):
    """Application factory pattern"""
    app = Flask(__name__, 
                static_folder='../frontend',
                static_url_path='')
    
    # Configure logging first
    setup_logging(app)
    
    app.config.from_object(config_class)
    
    # Initialize Extensions
    # ---------------------
    
    # CORS
    # Using strict mode from config
    cors.init_app(app, resources={
        r"/api/*": {
            "origins": config_class.CORS_ORIGINS,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
            "max_age": 600
        }
    })
    
    # Rate Limiting
    limiter.init_app(app)
    
    # Security Headers (Talisman)
    # Define Content Security Policy (CSP)
    # For development/dashboard, we need to be somewhat permissive with scripts and styles
    csp = {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"], # unsafe-eval needed for some dev tools
        'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        'font-src': ["'self'", "https://fonts.gstatic.com", "data:"],
        'img-src': ["'self'", "data:", "blob:"],
        'connect-src': ["'self'", "http://localhost:*", "ws://localhost:*"] # Allow WebSocket for HMR if needed
    }
    
    talisman.init_app(app, content_security_policy=csp, force_https=False) # Force HTTPS false for localhost
    
    # Initialize Firebase
    FirebaseHelper.initialize(config_class.FIREBASE_CREDENTIALS_PATH)
    
    # Register blueprints
    app.register_blueprint(subscription_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(main_bp)
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error'}, 500
    
    # Warmup: Preload heavy libraries at startup (trades startup time for faster first request)
    # This uses ~250MB but makes the dashboard load instantly for users
    def warmup_heavy_libs():
        import logging
        logger = logging.getLogger(__name__)
        logger.info("Warming up heavy libraries...")
        try:
            # Preload analytics libs
            from analytics.analyzer import _ensure_analytics_libs
            _ensure_analytics_libs()
            
            # Preload ML libs
            from analytics.predictor import _ensure_ml_libs
            _ensure_ml_libs()
            
            logger.info("Warmup complete - libs preloaded")
        except Exception as e:
            logger.warning(f"Warmup failed (non-critical): {e}")
    
    # Run warmup in production (when running under gunicorn)
    if not app.debug:
        warmup_heavy_libs()
    
    return app


# Create app instance for Gunicorn (production)
app = create_app()


if __name__ == '__main__':
    app = create_app()
    
    print("=" * 60)
    print("Subscription Analyzer Backend (Refactored)")
    print("=" * 60)
    print(f"Server running on: http://{Config.HOST}:{Config.PORT}")
    print(f"Firebase: {'Connected' if FirebaseHelper.is_available() else 'Offline Mode'}")
    print(f"Debug mode: {Config.DEBUG}")
    print("=" * 60)
    print("\nAPI Endpoints:")
    print("  GET  /api/health")
    print("  GET  /api/subscriptions")
    print("  GET  /api/analytics/summary")
    print("  ... and more")
    print("=" * 60)
    print("\nPress CTRL+C to stop the server\n")
    
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )

