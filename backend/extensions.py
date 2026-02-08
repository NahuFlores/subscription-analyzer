"""
Extensions module - Initialize Flask extensions here to avoid circular imports.
"""
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
from flask_cors import CORS

# Initialize extensions (unbound)
# They will be initialized with the app in create_app()

# Rate Limiting
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
    strategy="fixed-window"
)

# Security Headers (Content Security Policy)
# wide-open CSP for development to prevent breaking React scripts/styles
# In production, this should be tightened.
talisman = Talisman()

# CORS
cors = CORS()
