"""
Flask Application - Main entry point
Subscription Analyzer Backend
"""
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import Config
from utils import FirebaseHelper
from routes import subscription_bp, analytics_bp


def create_app(config_class=Config):
    """Application factory pattern"""
    app = Flask(__name__, 
                static_folder='../frontend',
                static_url_path='')
    app.config.from_object(config_class)
    
    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": config_class.CORS_ORIGINS}})
    
    # Initialize Firebase
    FirebaseHelper.initialize(config_class.FIREBASE_CREDENTIALS_PATH)
    
    # Register blueprints
    app.register_blueprint(subscription_bp)
    app.register_blueprint(analytics_bp)
    
    # Root route - serve frontend
    @app.route('/')
    def index():
        return send_from_directory(app.static_folder, 'index.html')
    
    @app.route('/dashboard')
    def dashboard():
        return send_from_directory(app.static_folder, 'dashboard.html')
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'firebase_available': FirebaseHelper.is_available(),
            'version': '1.0.0'
        }), 200
    
    # Categories endpoint
    @app.route('/api/categories', methods=['GET'])
    def get_categories():
        from models import Category
        categories = []
        
        for cat_name in Category.get_all_categories():
            cat_info = Category.get_category_info(cat_name)
            categories.append({
                'name': cat_name,
                'icon': cat_info['icon'],
                'color': cat_info['color']
            })
        
        return jsonify({
            'success': True,
            'categories': categories
        }), 200
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app


if __name__ == '__main__':
    app = create_app()
    
    print("=" * 60)
    print("🚀 Subscription Analyzer Backend")
    print("=" * 60)
    print(f"📍 Server running on: http://{Config.HOST}:{Config.PORT}")
    print(f"🔥 Firebase: {'✅ Connected' if FirebaseHelper.is_available() else '⚠️  Offline Mode'}")
    print(f"🐛 Debug mode: {Config.DEBUG}")
    print("=" * 60)
    print("\n📚 API Endpoints:")
    print("  GET  /api/health")
    print("  GET  /api/categories")
    print("  GET  /api/subscriptions?user_id=<id>")
    print("  POST /api/subscriptions")
    print("  GET  /api/subscriptions/<id>")
    print("  PUT  /api/subscriptions/<id>")
    print("  DELETE /api/subscriptions/<id>")
    print("  GET  /api/analytics/summary?user_id=<id>")
    print("  GET  /api/analytics/predictions?user_id=<id>")
    print("  GET  /api/analytics/charts?user_id=<id>")
    print("  GET  /api/analytics/insights?user_id=<id>")
    print("=" * 60)
    print("\n⌨️  Press CTRL+C to stop the server\n")
    
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )
