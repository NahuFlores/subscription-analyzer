
# Test script for AI Advisor
import os
from dotenv import load_dotenv
from analytics.ai_advisor import AIAdvisor

# Load environment variables
load_dotenv()

def test_ai():
    print("Testing AI Advisor Connection...")
    print(f"API Key present: {'Yes' if os.getenv('GROQ_API_KEY') else 'No'}")
    
    advisor = AIAdvisor()
    
    # Dummy data
    subscriptions = [
        {'name': 'Netflix', 'cost': 15.99, 'billing_cycle': 'monthly', 'category': 'Entertainment'},
        {'name': 'Spotify', 'cost': 9.99, 'billing_cycle': 'monthly', 'category': 'Music'},
        {'name': 'Apple Music', 'cost': 10.99, 'billing_cycle': 'monthly', 'category': 'Music'},
        {'name': 'Gym', 'cost': 50.00, 'billing_cycle': 'monthly', 'category': 'Health'}
    ]
    total_cost = sum(s['cost'] for s in subscriptions)
    
    print("\nSending request to Groq (Llama 3)...")
    try:
        result = advisor.generate_insights(subscriptions, total_cost)
        
        print("\n--- AI Response ---")
        print(f"Summary: {result.get('summary')}")
        print("Insights:")
        for insight in result.get('insights', []):
            print(f"- {insight}")
            
        print(f"\nRisk Score: {result.get('risk_score')}")
        
    except Exception as e:
        print(f"\nFATAL ERROR: {e}")

if __name__ == "__main__":
    test_ai()
