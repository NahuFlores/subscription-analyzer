"""
Subscription models - Base class and specialized subscription types
Demonstrates OOP principles: Inheritance, Polymorphism, Abstraction
"""
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import Dict, Optional
import uuid


class Subscription(ABC):
    """
    Abstract base class for all subscription types
    Demonstrates: Abstraction, Encapsulation
    """
    
    def __init__(self, user_id: str, name: str, cost: float, 
                 start_date: datetime, category: str = "Other",
                 subscription_id: Optional[str] = None,
                 is_active: bool = True, notes: str = ""):
        self._subscription_id = subscription_id or str(uuid.uuid4())
        self._user_id = user_id
        self._name = name
        self._cost = self._validate_cost(cost)
        self._start_date = start_date
        self._category = category
        self._is_active = is_active
        self._notes = notes
        self._created_at = datetime.now()
        self._updated_at = datetime.now()
    
    @staticmethod
    def _validate_cost(cost: float) -> float:
        """Validate that cost is positive"""
        if cost < 0:
            raise ValueError("Cost cannot be negative")
        return round(cost, 2)
    
    # Properties (Encapsulation)
    @property
    def subscription_id(self) -> str:
        return self._subscription_id
    
    @property
    def user_id(self) -> str:
        return self._user_id
    
    @property
    def name(self) -> str:
        return self._name
    
    @property
    def cost(self) -> float:
        return self._cost
    
    @property
    def start_date(self) -> datetime:
        return self._start_date
    
    @property
    def category(self) -> str:
        return self._category
    
    @property
    def is_active(self) -> bool:
        return self._is_active
    
    @property
    def notes(self) -> str:
        return self._notes
    
    # Setters with validation
    @cost.setter
    def cost(self, value: float):
        self._cost = self._validate_cost(value)
        self._updated_at = datetime.now()
    
    @is_active.setter
    def is_active(self, value: bool):
        self._is_active = value
        self._updated_at = datetime.now()
    
    @abstractmethod
    def calculate_next_billing(self) -> datetime:
        """Calculate next billing date - must be implemented by subclasses"""
        pass
    
    @abstractmethod
    def get_billing_cycle(self) -> str:
        """Get billing cycle type - must be implemented by subclasses"""
        pass
    
    def calculate_annual_cost(self) -> float:
        """Calculate total annual cost"""
        # This will be overridden by subclasses for accurate calculation
        return self._cost * 12
    
    def to_dict(self) -> Dict:
        """Convert subscription to dictionary for Firebase storage"""
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
    
    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(name={self._name}, cost=${self._cost})"
    
    def __str__(self) -> str:
        return f"{self._name} - ${self._cost}/{self.get_billing_cycle()}"


class MonthlySubscription(Subscription):
    """
    Monthly subscription - bills every month
    Demonstrates: Inheritance, Polymorphism
    """
    
    def calculate_next_billing(self) -> datetime:
        """Calculate next monthly billing date"""
        today = datetime.now()
        # Start from the start date
        next_billing = self._start_date
        
        # Keep adding months until we're in the future
        while next_billing <= today:
            # Add one month
            if next_billing.month == 12:
                next_billing = next_billing.replace(year=next_billing.year + 1, month=1)
            else:
                next_billing = next_billing.replace(month=next_billing.month + 1)
        
        return next_billing
    
    def get_billing_cycle(self) -> str:
        return "monthly"
    
    def calculate_annual_cost(self) -> float:
        """Monthly subscriptions: cost * 12"""
        return self._cost * 12


class AnnualSubscription(Subscription):
    """
    Annual subscription - bills once per year
    Demonstrates: Inheritance, Polymorphism
    """
    
    def calculate_next_billing(self) -> datetime:
        """Calculate next annual billing date"""
        today = datetime.now()
        next_billing = self._start_date
        
        # Keep adding years until we're in the future
        while next_billing <= today:
            next_billing = next_billing.replace(year=next_billing.year + 1)
        
        return next_billing
    
    def get_billing_cycle(self) -> str:
        return "annual"
    
    def calculate_annual_cost(self) -> float:
        """Annual subscriptions: just the cost"""
        return self._cost


class CustomSubscription(Subscription):
    """
    Custom subscription - bills every N days
    Demonstrates: Inheritance, Polymorphism, Extended functionality
    """
    
    def __init__(self, user_id: str, name: str, cost: float, 
                 start_date: datetime, custom_days: int,
                 category: str = "Other", subscription_id: Optional[str] = None,
                 is_active: bool = True, notes: str = ""):
        super().__init__(user_id, name, cost, start_date, category, 
                        subscription_id, is_active, notes)
        self._custom_days = custom_days
    
    @property
    def custom_days(self) -> int:
        return self._custom_days
    
    def calculate_next_billing(self) -> datetime:
        """Calculate next billing date based on custom days"""
        today = datetime.now()
        next_billing = self._start_date
        
        # Keep adding custom_days until we're in the future
        while next_billing <= today:
            next_billing = next_billing + timedelta(days=self._custom_days)
        
        return next_billing
    
    def get_billing_cycle(self) -> str:
        return f"every {self._custom_days} days"
    
    def calculate_annual_cost(self) -> float:
        """Custom subscriptions: (365 / custom_days) * cost"""
        cycles_per_year = 365 / self._custom_days
        return self._cost * cycles_per_year
    
    def to_dict(self) -> Dict:
        """Override to include custom_days"""
        data = super().to_dict()
        data['custom_days'] = self._custom_days
        return data


# Factory Pattern for creating subscriptions
class SubscriptionFactory:
    """
    Factory class to create appropriate subscription type
    Demonstrates: Factory Design Pattern
    """
    
    @staticmethod
    def create_subscription(billing_cycle: str, **kwargs) -> Subscription:
        """
        Create subscription based on billing cycle
        
        Args:
            billing_cycle: 'monthly', 'annual', or 'custom'
            **kwargs: subscription parameters
        
        Returns:
            Appropriate Subscription subclass instance
        """
        if billing_cycle == 'monthly':
            return MonthlySubscription(**kwargs)
        elif billing_cycle == 'annual':
            return AnnualSubscription(**kwargs)
        elif billing_cycle == 'custom':
            return CustomSubscription(**kwargs)
        else:
            raise ValueError(f"Unknown billing cycle: {billing_cycle}")
    
    @staticmethod
    def from_dict(data: Dict) -> Subscription:
        """Create subscription from dictionary"""
        billing_cycle = data.get('billing_cycle', 'monthly')
        
        kwargs = {
            'subscription_id': data.get('subscription_id'),
            'user_id': data['user_id'],
            'name': data['name'],
            'cost': data['cost'],
            'start_date': datetime.fromisoformat(data['start_date']),
            'category': data.get('category', 'Other'),
            'is_active': data.get('is_active', True),
            'notes': data.get('notes', '')
        }
        
        if billing_cycle == 'custom' or 'custom_days' in data:
            kwargs['custom_days'] = data.get('custom_days', 30)
            return CustomSubscription(**kwargs)
        elif billing_cycle == 'annual':
            return AnnualSubscription(**kwargs)
        else:
            return MonthlySubscription(**kwargs)
