"""
Routes package initialization
"""
from .subscription_routes import subscription_bp
from .subscription_routes import subscription_bp
from .analytics_routes import analytics_bp
from .main_routes import main_bp


__all__ = ['subscription_bp', 'analytics_bp']
