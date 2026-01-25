"""
Routes package initialization
"""
from .subscription_routes import subscription_bp
from .analytics_routes import analytics_bp

__all__ = ['subscription_bp', 'analytics_bp']
