from models.subscription import SubscriptionFactory
from datetime import datetime

# Test Annual Subscription
try:
    sub = SubscriptionFactory.create_subscription(
        billing_cycle='annual',
        user_id='test_user',
        name='Annual Gym',
        cost=120.0,
        start_date=datetime.now()
    )
    
    print(f"Created: {sub.name}")
    print(f"Cost: {sub.cost}")
    print(f"Cycle: {sub.get_billing_cycle()}")
    print(f"Annual Cost: {sub.calculate_annual_cost()}")
    print(f"Next Billing: {sub.calculate_next_billing()}")

    # Test Analytics Logic (Manual)
    monthly_cost = sub.calculate_annual_cost() / 12
    print(f"Amortized Monthly Cost: {monthly_cost}")
    
    assert monthly_cost == 10.0, f"Expected 10.0, got {monthly_cost}"
    print("SUCCESS: Logic handles annual subscriptions correctly.")

except Exception as e:
    print(f"FAILURE: {e}")
