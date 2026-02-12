
"""
AI Advisor - Generative AI module for financial insights
Uses Groq API (Llama 3) to analyze subscription data and provide actionable advice.
"""
import os
import json
import logging
from typing import List, Dict, Any
from groq import Groq
from config import Config

logger = logging.getLogger(__name__)

class AIAdvisor:
    """
    Intelligent Financial Advisor using Large Language Models.
    """
    
    def __init__(self):
        self.api_key = os.getenv('GROQ_API_KEY')
        self.client = None
        self.model = os.getenv('AI_MODEL_NAME', 'llama3-70b-8192')
        
        if self.api_key:
            try:
                self.client = Groq(api_key=self.api_key)
                logger.info(f"AI Advisor initialized with model: {self.model}")
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {e}")
        else:
            logger.warning("GROQ_API_KEY not found in environment variables. AI features disabled.")

    def _format_subscriptions_for_prompt(self, subscriptions: List[Dict]) -> str:
        """
        Convert list of subscriptions to a lightweight string representation for the LLM.
        Minimizes token usage while keeping essential info.
        """
        summary = []
        for sub in subscriptions:
            # Format: "Netflix ($15.99/mo, Entertainment)"
            summary.append(f"- {sub.get('name', 'Unknown')}: ${sub.get('cost', 0)}/{sub.get('billing_cycle', 'monthly')} ({sub.get('category', 'Other')})")
        return "\n".join(summary)

    def generate_insights(self, subscriptions: List[Dict], total_monthly_cost: float) -> Dict[str, Any]:
        """
        Generate personalized financial insights using GenAI.
        
        Args:
            subscriptions: List of subscription dictionaries
            total_monthly_cost: Total monthly expenditure
            
        Returns:
            Dictionary containing 'insights' (list of strings) and 'summary' (string)
        """
        if not self.client:
            return {
                "insights": ["AI Advisor is not configured. Please check your API Key."],
                "summary": "AI features are currently unavailable."
            }
            
        if not subscriptions:
            return {
                "insights": ["No subscriptions found to analyze."],
                "summary": "Add some subscriptions to get AI insights!"
            }

        subs_text = self._format_subscriptions_for_prompt(subscriptions)
        
        system_prompt = """
        You are an expert Financial Advisor specializing in subscription optimization. 
        Your goal is to save the user money and identify wasteful spending.
        
        Analyze the provided subscription list.
        
        Output MUST be valid JSON with this structure:
        {
            "summary": "A 1-sentence punched summary of their spending habits.",
            "insights": [
                "Specific actionable advice 1 (e.g., 'Switch Netflix to annual...')",
                "Specific actionable advice 2 (e.g., 'You have 3 music apps, cancel 2...')",
                "Specific actionable advice 3"
            ],
            "risk_score": 1-10 (1=safe, 10=wasteful)
        }
        
        Rules:
        1. Context Matters: If they only have 1-2 subscriptions and low total cost (<$50), the Risk Score should be LOW (1-3). Don't panic over small amounts.
        2. Categorization: Netflix/Spotify are "Entertainment", NOT "Utilities". AWS/GitHub are "Productivity" or "Work".
        3. Be Direct: Suggest cheaper alternatives or annual plans if common (Disney+, HBO, etc.).
        4. Detect Duplicates: Mark having multiple similar services (e.g. 2 music apps) as High Risk.
        5. Do NOT use markdown in the JSON values.
        """
        
        user_message = f"""
        Here is my subscription portfolio:
        Total Monthly Cost: ${total_monthly_cost}
        
        Subscriptions:
        {subs_text}
        
        Analyze this and tell me how to save money.
        """
        
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                model=self.model,
                temperature=0.7,
                max_tokens=1024,
                response_format={"type": "json_object"}
            )
            
            response_content = chat_completion.choices[0].message.content
            logger.debug(f"AI Response: {response_content}")
            
            return json.loads(response_content)
            
        except Exception as e:
            logger.error(f"Error generating AI insights: {e}", exc_info=True)
            return {
                "insights": ["Unable to generate insights at this moment.", f"Error: {str(e)}"],
                "summary": "AI Service unavailable.",
                "risk_score": 0
            }
