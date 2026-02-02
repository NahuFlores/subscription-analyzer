"""
Centralized logging configuration
"""
import logging
import os
import sys
from pythonjsonlogger import jsonlogger
from flask import Flask

def setup_logging(app: Flask = None) -> None:
    """
    Configure application-wide logging
    
    Args:
        app: Optional Flask app instance to configure
    """
    log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
    log_file = os.getenv('LOG_FILE', 'logs/app.log')
    
    # Create logs directory if it doesn't exist
    if log_file and os.path.dirname(log_file):
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level))
    
    # Remove existing handlers to avoid duplication
    root_logger.handlers = []
    
    # 1. Console Handler (Human readable for dev)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, log_level))
    console_format = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(console_format)
    root_logger.addHandler(console_handler)
    
    # 2. File Handler (JSON for prod/parsing)
    # Only add file handler if a file path is configured
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.DEBUG) # Always log debug to file if configured
        
        # Use CustomJsonFormatter to handle non-serializable objects if needed, 
        # but standard JsonFormatter is usually enough for basic logs.
        json_format = jsonlogger.JsonFormatter(
            '%(timestamp)s %(level)s %(name)s %(message)s %(exc_info)s'
        )
        file_handler.setFormatter(json_format)
        root_logger.addHandler(file_handler)
    
    # Configure Flask specific logger
    if app:
        # Remove default Flask handlers
        app.logger.handlers = []
        # Propagate to root logger (which has our configured handlers)
        app.logger.propagate = True
        app.logger.setLevel(getattr(logging, log_level))
        
        app.logger.info(f"Logging initialized at {log_level} level")
        if log_file:
            app.logger.info(f"Logging to file: {log_file}")
