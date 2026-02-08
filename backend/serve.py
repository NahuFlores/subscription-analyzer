import os
import sys

# Add the current directory to the path so that imports work correctly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
from waitress import serve

if __name__ == "__main__":
    print("=" * 60)
    print("Subscription Analyzer - Production Server (Waitress)")
    print("=" * 60)
    print("Serving on http://0.0.0.0:5000")
    print("Press CTRL+C to stop")
    print("=" * 60)
    
    serve(app, host="0.0.0.0", port=5000)
