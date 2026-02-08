"""
Main routes - Serve frontend and general API endpoints
"""
import os
from flask import Blueprint, jsonify, send_from_directory, current_app
from models import Category
from utils import FirebaseHelper

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """Serve the landing page"""
    # In production/docker, static folder might be different, but app.static_folder should be correct
    return send_from_directory(current_app.static_folder, 'index.html')

@main_bp.route('/dashboard')
@main_bp.route('/dashboard/')
@main_bp.route('/dashboard/<path:path>')
def dashboard(path=''):
    """Serve the React dashboard SPA"""
    # Pointing to dashboard/dist relative to backend/app.py location
    # Since this file is in backend/routes/, we go up one level relative to app root
    # or rely on a config or helper.
    # Original logic used __file__ relative to app.py.
    
    # Best practice: Use current_app.root_path or configured path
    # But for now, let's replicate logic relative to backend root
    
    # We assume 'backend' is the root of the python app context
    dashboard_folder = os.path.join(current_app.root_path, '../dashboard/dist')
    dashboard_folder = os.path.abspath(dashboard_folder)
    
    # Check if dashboard/dist exists
    if not os.path.exists(dashboard_folder):
        return jsonify({
            'error': 'Dashboard not built',
            'message': 'Run "cd dashboard && npm run build" to build the dashboard'
        }), 503
    
    # Try to serve specific file if it exists (for assets)
    if path:
        file_path = os.path.join(dashboard_folder, path)
        if os.path.isfile(file_path):
            return send_from_directory(dashboard_folder, path)
    
    # Otherwise serve index.html for client-side routing
    response = send_from_directory(dashboard_folder, 'index.html')
    
    # Disable caching for HTML to ensure updates are seen
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

@main_bp.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'firebase_available': FirebaseHelper.is_available(),
        'version': '1.0.0'
    }), 200

@main_bp.route('/api/categories', methods=['GET'])
def get_categories():
    """Get all categories"""
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
