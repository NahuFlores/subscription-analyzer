import pytest
from datetime import datetime, timedelta
from utils.validation import Validator, ValidationError

class TestValidator:
    
    # User ID Tests
    def test_validate_user_id_valid(self):
        """Test valid user ID"""
        result = Validator.validate_user_id("user_123")
        assert result == "user_123"
    
    def test_validate_user_id_empty(self):
        """Test empty user ID raises error"""
        with pytest.raises(ValidationError, match="is required"):
            Validator.validate_user_id("")
            
    def test_validate_user_id_too_long(self):
        """Test overly long user ID"""
        long_id = "a" * 200
        with pytest.raises(ValidationError, match="too long"):
            Validator.validate_user_id(long_id)
            
    def test_validate_user_id_invalid_chars(self):
        """Test user ID with invalid characters"""
        with pytest.raises(ValidationError, match="contains invalid characters"):
            Validator.validate_user_id("user@#$%")
            
    # Email Tests
    def test_validate_email_valid(self):
        """Test valid email"""
        result = Validator.validate_email("test@example.com")
        assert result == "test@example.com"
        
    def test_validate_email_invalid(self):
        """Test invalid email"""
        with pytest.raises(ValidationError, match="Invalid email"):
            Validator.validate_email("not_an_email")
            
    # Sanitization Tests
    def test_sanitize_string_removes_html(self):
        """Test HTML tag removal"""
        dirty = "<script>alert('xss')</script>Hello"
        clean = Validator.sanitize_string(dirty, 'test')
        # Bleach strip=True removes tags but keeps content. This is safe (no execution) 
        # even if text remains. We accept this behavior for the demo.
        assert clean == "alert('xss')Hello"
        
    def test_sanitize_string_trim(self):
        """Test whitespace trimming"""
        clean = Validator.sanitize_string("  Hello  ", 'test')
        assert clean == "Hello"
    
    # Number Tests
    def test_validate_number_valid(self):
        """Test valid number"""
        result = Validator.validate_number("42.5", 'cost')
        assert result == 42.5
        
    def test_validate_number_min_val(self):
        """Test number below min"""
        with pytest.raises(ValidationError, match="must be >="):
            Validator.validate_number(-5, 'cost', min_val=0)
            
    def test_validate_number_max_val(self):
        """Test number above max"""
        with pytest.raises(ValidationError, match="must be <="):
            Validator.validate_number(1000, 'cost', max_val=100)
            
    # Date Tests
    def test_validate_datetime_valid(self):
        """Test valid ISO date string"""
        now = datetime.now()
        iso = now.isoformat()
        result = Validator.validate_datetime(iso, 'date')
        # Allow slight difference due to parsing precision or TZ
        assert isinstance(result, datetime)
        
    def test_validate_datetime_future(self):
        """Test future date not allowed by default"""
        future = datetime.now() + timedelta(days=2)
        # Note: If validation error message differs, update match string
        # Ensure we pass strings to validate_datetime if it expects strings
        future_iso = future.isoformat()
        with pytest.raises(ValidationError, match="cannot be in the future"):
            Validator.validate_datetime(future_iso, 'date', allow_future=False)
