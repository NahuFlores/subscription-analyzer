"""
Subscription models - Base class and specialized subscription types
Refactored for Clean Code (Constants, Type Safety, SRP)
"""
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import Optional, Tuple
import uuid
import calendar

# --- Constants ---
MAX_COST_LIMIT = 10000.0
MAX_NAME_LENGTH = 100
MAX_NOTES_LENGTH = 500
MAX_CATEGORY_LENGTH = 50

class Subscription(ABC):
    """
    Abstract base class for all subscription types.
    Responsible for holding subscription state and basic validation.
    """
    
    def __init__(self, user_id: str, name: str, cost: float, 
                 start_date: datetime, category: str = "Other",
                 subscription_id: Optional[str] = None,
                 is_active: bool = True, notes: str = ""):
        
        self._validate_inputs(user_id, name, cost, start_date)
        
        self._subscription_id = subscription_id or str(uuid.uuid4())
        self._user_id = user_id.strip()
        self._name = name.strip()
        self._cost = round(float(cost), 2)
        self._start_date = start_date
        self._category = category.strip() if category else "Other"
        self._is_active = bool(is_active)
        self._notes = notes.strip() if notes else ""
        self._created_at = datetime.now()
        self._updated_at = datetime.now()

    def _validate_inputs(self, user_id: str, name: str, cost: float, start_date: datetime):
        """Validate input parameters against constraints."""
        if not isinstance(user_id, str):
            raise TypeError(f"user_id must be str, got {type(user_id).__name__}")
            
        if not user_id.strip():
            raise ValueError("user_id cannot be empty")
            
        if len(name.strip()) > MAX_NAME_LENGTH:
            raise ValueError(f"name too long (max {MAX_NAME_LENGTH} characters)")
            
        if cost < 0:
            raise ValueError("cost cannot be negative")
            
        if cost > MAX_COST_LIMIT:
            raise ValueError(f"cost exceeds limit (${MAX_COST_LIMIT})")

    # Properties
    @property
    def subscription_id(self) -> str: return self._subscription_id
    
    @property
    def user_id(self) -> str: return self._user_id
    
    @property
    def name(self) -> str: return self._name
    
    @property
    def cost(self) -> float: return self._cost
    
    @property
    def start_date(self) -> datetime: return self._start_date
    
    @property
    def category(self) -> str: return self._category
    
    @property
    def is_active(self) -> bool: return self._is_active
    
    @property
    def notes(self) -> str: return self._notes

    @abstractmethod
    def calculate_next_billing(self) -> datetime:
        """Calculate next billing date"""
        pass
    
    @abstractmethod
    def get_billing_cycle(self) -> str:
        """Get billing cycle identifier"""
        pass
    
    def calculate_annual_cost(self) -> float:
        """Default: cost * 12 (Monthly)"""
        return self._cost * 12
    
    def to_dict(self) -> dict:
        """Convert to dictionary for storage"""
        return {
            'subscription_id': self._subscription_id,
            'user_id': self._user_id,
            'name': self._name,
            'cost': self._cost,
            'billing_cycle': self.get_billing_cycle(),
            'start_date': self._start_date.isoformat(),
            'next_billing': self.calculate_next_billing().isoformat(),
            'category': self._category,
            'is_active': self._is_active,
            'notes': self._notes,
            'created_at': self._created_at.isoformat(),
            'updated_at': self._updated_at.isoformat()
        }

class MonthlySubscription(Subscription):
    """Bills every month"""
    
    def calculate_next_billing(self) -> datetime:
        today = datetime.now()
        next_billing = self._start_date
        
        while next_billing <= today:
            year, month = next_billing.year, next_billing.month
            
            # Smart Month Addition
            new_month = month + 1
            new_year = year + (1 if new_month > 12 else 0)
            if new_month > 12: new_month = 1
                
            # Handle Feb 28/29, Apr 30, etc.
            _, last_day_of_new_month = calendar.monthrange(new_year, new_month)
            new_day = min(self._start_date.day, last_day_of_new_month)
            
            next_billing = next_billing.replace(year=new_year, month=new_month, day=new_day)
        
        return next_billing
    
    def get_billing_cycle(self) -> str:
        return "monthly"

class AnnualSubscription(Subscription):
    """Bills once per year"""
    
    def calculate_next_billing(self) -> datetime:
        today = datetime.now()
        next_billing = self._start_date
        while next_billing <= today:
            next_billing = next_billing.replace(year=next_billing.year + 1)
        return next_billing
    
    def get_billing_cycle(self) -> str:
        return "annual"
    
    def calculate_annual_cost(self) -> float:
        return self._cost

class CustomSubscription(Subscription):
    """Bills every N days"""
    
    def __init__(self, custom_days: int = 30, **kwargs):
        super().__init__(**kwargs)
        self._custom_days = custom_days
    
    def calculate_next_billing(self) -> datetime:
        today = datetime.now()
        next_billing = self._start_date
        while next_billing <= today:
            next_billing += timedelta(days=self._custom_days)
        return next_billing
    
    def get_billing_cycle(self) -> str:
        return f"every {self._custom_days} days"
    
    def calculate_annual_cost(self) -> float:
        return self._cost * (365 / self._custom_days)
    
    def to_dict(self) -> dict:
        data = super().to_dict()
        data['custom_days'] = self._custom_days
        return data

class SubscriptionFactory:
    """Factory to create Subscription instances"""
    
    @staticmethod
    def create_subscription(billing_cycle: str, **kwargs) -> Subscription:
        if billing_cycle == 'monthly':
            return MonthlySubscription(**kwargs)
        elif billing_cycle == 'annual':
            return AnnualSubscription(**kwargs)
        elif billing_cycle == 'custom':
            days = kwargs.pop('custom_days', 30)
            return CustomSubscription(custom_days=days, **kwargs)
        else:
            raise ValueError(f"Unknown billing cycle: {billing_cycle}")

    @staticmethod
    def from_dict(data: dict) -> Subscription:
        cycle = data.get('billing_cycle', 'monthly')
        
        params = {
            'subscription_id': data.get('subscription_id'),
            'user_id': data['user_id'],
            'name': data['name'],
            'cost': data['cost'],
            'start_date': datetime.fromisoformat(data['start_date']),
            'category': data.get('category', 'Other'),
            'is_active': data.get('is_active', True),
            'notes': data.get('notes', '')
        }
        
        if cycle == 'custom' or 'custom_days' in data:
            params['custom_days'] = data.get('custom_days', 30)
            return CustomSubscription(**params)
        elif cycle == 'annual':
            return AnnualSubscription(**params)
        else:
            return MonthlySubscription(**params)
