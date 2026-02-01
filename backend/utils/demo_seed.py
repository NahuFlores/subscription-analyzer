"""
Demo data seeding for portfolio showcase
Provides realistic sample subscriptions to demonstrate the app's capabilities
"""
from datetime import datetime, timedelta
from models import SubscriptionFactory
from utils import FirebaseHelper
import random

# Demo user ID - used for portfolio showcase
DEMO_USER_ID = "demo_user"

# Realistic sample subscriptions with varied start dates
DEMO_SUBSCRIPTIONS = [
    {
        "name": "Netflix",
        "cost": 15.99,
        "category": "Entertainment",
        "billing_cycle": "monthly",
        "months_ago": 8,  # Started 8 months ago
        "notes": "Premium 4K plan"
    },
    {
        "name": "Spotify",
        "cost": 9.99,
        "category": "Entertainment", 
        "billing_cycle": "monthly",
        "months_ago": 14,
        "notes": "Individual plan"
    },
    {
        "name": "Adobe Creative Cloud",
        "cost": 54.99,
        "category": "Productivity",
        "billing_cycle": "monthly",
        "months_ago": 6,
        "notes": "All Apps plan"
    },
    {
        "name": "GitHub Pro",
        "cost": 4.00,
        "category": "Development",
        "billing_cycle": "monthly",
        "months_ago": 18,
        "notes": "Developer essentials"
    },
    {
        "name": "AWS",
        "cost": 23.50,
        "category": "Cloud Services",
        "billing_cycle": "monthly",
        "months_ago": 10,
        "notes": "EC2 + S3 usage"
    },
    {
        "name": "Disney+",
        "cost": 7.99,
        "category": "Entertainment",
        "billing_cycle": "monthly",
        "months_ago": 4,
        "notes": "Ad-supported plan"
    },
    {
        "name": "Notion",
        "cost": 8.00,
        "category": "Productivity",
        "billing_cycle": "monthly",
        "months_ago": 12,
        "notes": "Personal Pro"
    },
    {
        "name": "ChatGPT Plus",
        "cost": 20.00,
        "category": "Development",
        "billing_cycle": "monthly",
        "months_ago": 3,
        "notes": "GPT-4 access"
    },
    {
        "name": "iCloud+",
        "cost": 2.99,
        "category": "Cloud Services",
        "billing_cycle": "monthly",
        "months_ago": 24,
        "notes": "200GB storage"
    },
    {
        "name": "YouTube Premium",
        "cost": 13.99,
        "category": "Entertainment",
        "billing_cycle": "monthly",
        "months_ago": 7,
        "notes": "Ad-free + Music"
    },
    {
        "name": "Figma",
        "cost": 12.00,
        "category": "Productivity",
        "billing_cycle": "monthly",
        "months_ago": 9,
        "notes": "Professional plan"
    },
    {
        "name": "LinkedIn Premium",
        "cost": 29.99,
        "category": "Productivity",
        "billing_cycle": "monthly",
        "months_ago": 2,
        "notes": "Career tier"
    }
]


def seed_demo_data(clear_existing=True):
    """
    Seed demo data into Firebase for the demo user
    
    Args:
        clear_existing: If True, removes existing demo user subscriptions first
    
    Returns:
        dict with success status and count of created subscriptions
    """
    results = {
        "success": True,
        "created": 0,
        "errors": [],
        "user_id": DEMO_USER_ID
    }
    
    try:
        # Clear existing demo data if requested
        if clear_existing:
            existing = FirebaseHelper.get_user_subscriptions(DEMO_USER_ID)
            for sub in existing:
                FirebaseHelper.delete_subscription(sub.get('subscription_id'))
            results["cleared"] = len(existing)
        
        # Create demo subscriptions
        for sub_data in DEMO_SUBSCRIPTIONS:
            try:
                # Calculate start date based on months_ago
                months_ago = sub_data.get("months_ago", 1)
                start_date = datetime.now() - timedelta(days=months_ago * 30)
                
                # Create subscription object
                subscription = SubscriptionFactory.create_subscription(
                    billing_cycle=sub_data["billing_cycle"],
                    user_id=DEMO_USER_ID,
                    name=sub_data["name"],
                    cost=sub_data["cost"],
                    start_date=start_date,
                    category=sub_data["category"],
                    notes=sub_data.get("notes", "")
                )
                
                # Save to Firebase
                success = FirebaseHelper.create_subscription(subscription.to_dict())
                
                if success:
                    results["created"] += 1
                else:
                    results["errors"].append(f"Failed to create {sub_data['name']}")
                    
            except Exception as e:
                results["errors"].append(f"Error creating {sub_data['name']}: {str(e)}")
        
        if results["errors"]:
            results["success"] = len(results["errors"]) < len(DEMO_SUBSCRIPTIONS)
            
    except Exception as e:
        results["success"] = False
        results["errors"].append(f"Seed operation failed: {str(e)}")
    
    return results


def get_demo_user_id():
    """Get the demo user ID"""
    return DEMO_USER_ID
